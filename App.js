import React from 'react';
import {ActivityIndicator, View, Button, YellowBox} from 'react-native';
import DayView from "./views/DayView";
import EventView from "./views/EventView";
import {ManageVenues, VenueView} from "./views/VenueViews";
import {ManageClients, ClientView} from "./views/ClientViews";
import Database from "./Database";
import Styles from "./styles";
import {createStackNavigator, createAppContainer, createSwitchNavigator} from "react-navigation";
import {CalendarList} from "react-native-calendars";
import {AppContainer, toDateTime, toDateString, toMonthString, toLocalTime, randomColor, Dropdown, MoreButton} from "./util";
import LoginView from "./views/LoginView";
import {withMappedNavigationProps} from "react-navigation-props-mapper";

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

            loadedData.viewedMonths = [toMonthString(toLocalTime(new Date()))];

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
            selectedYear: currentDate.getFullYear()
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
                        onValueChange = {venueID =>
                            this.setState({selectedVenue: loadedData.venues.find(venue => venue.id === venueID)})
                        }
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
                </View>
                <CalendarList style={Styles.monthView}
                    horizontal = {true}
                    pagingEnabled = {true}
                    hideArrows = {true}
                    markingType = "multi-dot"
                    markedDates = {this._generateMarkedDates()}
                    onVisibleMonthsChange = {(date) => {
                        let fullDate = date[0].dateString;
                        let monthString = fullDate.substring(0, 7);
                        if(!(loadedData.viewedMonths.includes(monthString)) && !(monthString > loadedData.viewedMonths[0])) {
                            loadedData.viewedMonths.push(monthString);
                            Promise.all([db.getMonthEvents(fullDate)]).then(values => {
                                loadedData.events = loadedData.events.concat(values[0]);
                                this.forceUpdate();
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
                        onPress = {() => {
                            let formDate = new Date(this.state.selectedYear, this.state.selectedMonth, 1);
                            db.sendForms(this.state.selectedVenue, formDate).then(() => {
                                alert("Successfully began sending emails! " +
                                    "Please note that it may take up to a minute for all emails to send.");
                            }).catch(err => {
                                alert("An error occurred while sending the emails.\n" + err);
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
