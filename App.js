import React from 'react';
import {ActivityIndicator, Button, View, YellowBox} from 'react-native';
import DayView from "./views/DayView";
import EventView from "./views/EventView";
import {ManageVenues, VenueView} from "./views/VenueViews";
import {ClientView, ManageClients} from "./views/ClientViews";
import Database from "./Database";
import Styles from "./styles";
import {createAppContainer, createStackNavigator, createSwitchNavigator, NavigationEvents} from "react-navigation";
import {CalendarList} from "react-native-calendars";
import {randomColor, toDateString, toDateTime, toMonthString} from "./util";
import _ from "lodash";
import LoginView from "./views/LoginView";
import {withMappedNavigationProps} from "react-navigation-props-mapper";
import Dropdown from "./components/Dropdown";
import AppContainer from "./components/AppContainer";
import MoreButton from "./components/MoreButton";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
YellowBox.ignoreWarnings(['Setting a timer']);

//stores all clients/events/venues loaded from the database, to prevent unnecessary db calls
let loadedData = {
    clients: null,
    events: null,
    venues: null,
    viewedMonths: null
};

let db = null;

@withMappedNavigationProps()
class LoadingScreen extends React.Component {
    componentWillMount() {
        db = new Database();

        Promise.all([db.getClients(), db.getCurrentMonthAndUpcomingEvents(), db.getVenues()]).then(values => {
            loadedData.clients = values[0];
            loadedData.events = values[1];
            loadedData.venues = values[2];

            loadedData.viewedMonths = [toMonthString(new Date())];

            this.props.navigation.navigate("App");
        }).catch(err => console.log(err));
    }

    render() {
        return(
            <AppContainer>
                <ActivityIndicator size="large"/>
            </AppContainer>
        );
    }
}

class MonthView extends React.Component {
    constructor(props) {
        super(props);

        let currentDate = new Date();

        this.state = {
            selectedVenue: loadedData.venues[0],
            selectedMonth: currentDate.getMonth(),
            selectedYear: currentDate.getFullYear(),
            disableSendingEmails: false
        };
    }

    _generateMarkedDates() {
        let colors = {};
        loadedData.clients.forEach(client => {
            colors[client.id] = {
                key: client.id,
                color: randomColor(client.id).hex
            };
        });

        let filteredEvents = loadedData.events.filter(event => event.venueID === this.state.selectedVenue.id);
        let markedDates = {};
        filteredEvents.forEach(event => {
            let eventDate = toDateString(event.start);

            if (!markedDates[eventDate]) {
                markedDates[eventDate] = {dots: []};
            }
            markedDates[eventDate].dots.push(colors[event.clientID]);
        });

        return markedDates;
    }

    render() {
        return (
            <AppContainer>
                <View style={Styles.calendarHeader}>
                    <Dropdown style={Styles.calendarDropdown}
                        options = {loadedData.venues.map(venue => {
                            return {
                                label: venue.name,
                                value: venue.id
                            };
                        })}
                        selectedValue = {this.state.selectedVenue.id}
                        onValueChange = {venueID => {
                            if (venueID !== null) {
                                this.setState({selectedVenue: loadedData.venues.find(venue => venue.id === venueID)})
                            }
                        }}
                    />
                    <MoreButton
                        onPress={() => this.props.navigation.navigate("VenueManage", {
                            venueList: loadedData.venues,
                            database: db,
                            onReturn: venues => {
                                console.log(venues);
                            }
                        })}
                    />
                    />
                    <NavigationEvents
                        onWillFocus = {() => {
                            this.forceUpdate();
                        }}
                    />
                </View>
                <CalendarList style={Styles.monthView}
                    horizontal = {true}
                    pagingEnabled = {true}
                    hideArrows = {true}
                    markingType = "multi-dot"
                    markedDates = {this._generateMarkedDates()}
                    onVisibleMonthsChange = {date => {
                        this.setState({
                            selectedMonth: date[0] ? date[0].month - 1 : this.state.selectedMonth,
                            selectedYear: date[0] ? date[0].year : this.state.selectedYear
                        });

                        let backupDate = this.state.selectedYear + "-" + this.state.selectedMonth + 1;

                        let fullDate = date[0] ? date[0].dateString : backupDate;
                        let monthString = fullDate.substring(0, 7);

                        if (!loadedData.viewedMonths.includes(monthString) && monthString < loadedData.viewedMonths[0]) {
                            loadedData.viewedMonths.push(monthString);

                            db.getMonthEvents(fullDate).then(events => {
                                if (events.length > 0) {
                                    loadedData.events = _.unionBy(loadedData.events, events, "id");
                                    this.forceUpdate();
                                }
                            }).catch(err => console.log(err));
                        }
                    }}
                    onDayPress = {day => {
                        this.props.navigation.navigate("Day", {
                            selectedDate: toDateTime({date: day.dateString}),
                            selectedVenue: this.state.selectedVenue,
                            loadedData: loadedData,
                            database: db
                        });
                    }}
                />
                <View style={Styles.buttonContainer}>
                    <Button
                        title = "Generate Forms"
                        disabled = {this.state.disableSendingEmails}
                        onPress = {() => {
                            let formDate = new Date(this.state.selectedYear, this.state.selectedMonth, 1);
                            db.sendForms(this.state.selectedVenue, formDate).then(() => {
                                alert("Emails successfully sent!")
                            }).catch(err => {
                                alert("An error occurred while sending the emails.\n" + err);
                                console.error(err);
                            }).finally(() => {
                                this.setState({
                                    disableSendingEmails: false
                                })
                            });

                            alert("Emails have now begun sending." +
                                " Please wait until all emails have been sent before requesting more." +
                                " This may take up to a minute to complete.");
                            this.setState({
                                disableSendingEmails: true
                            });
                        }}
                    />
                </View>
            </AppContainer>
        );
    }
}

const AppStack = createStackNavigator({
    Month: MonthView,
    Day: DayView,
    Event: EventView,
    Venue: VenueView,
    VenueManage: ManageVenues,
    Client: ClientView,
    ClientManage: ManageClients
}, {
    initialRouteName: "Month",
    //initialRouteName: "Client",
    headerMode: "none",
    cardOverlayEnabled: true,
});

export default createAppContainer(createSwitchNavigator({
    Login: LoginView,
    Loading: LoadingScreen,
    App: AppStack
}, {
    initialRouteName: "Login",
    headerMode: "none"
}));
