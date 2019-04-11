import React from 'react';
import {ActivityIndicator, View, Button} from 'react-native';
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
import {generateBookingList, generateInvoice, generateArtistConfirmation} from "./pdfHandler";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

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

    _generateForms() {
        let matchingEvents = loadedData.events.filter(event =>
            event.start.getFullYear() === this.state.selectedYear &&
            event.start.getMonth() === this.state.selectedMonth
        );

        let bookingList = generateBookingList(this.state.selectedYear, this.state.selectedMonth, matchingEvents);
        //send email of booking list

        matchingEvents.forEach(event => {
            let matchingClient = loadedData.clients.find(client => client.id === event.clientID);
            let matchingVenue = loadedData.venues.find(venue => venue.id === event.venueID);

            let invoice = generateInvoice(matchingClient, event, matchingVenue);
            let artistConfirmation = generateArtistConfirmation(matchingClient, event, matchingVenue);

            //send email for invoice & artist confirmation
        });
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
                        onPress = {() => this._generateForms()}
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
