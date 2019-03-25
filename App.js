import React from 'react';
import {ActivityIndicator, Platform, View} from 'react-native';
import DayView from "./DayView";
import EventView from "./EventView";
import {ManageVenues, VenueView} from "./VenueViews";
import {ManageClients, ClientView} from "./ClientView";
import db from "./database";
import Styles from "./styles";
import {createStackNavigator, createAppContainer, createSwitchNavigator} from "react-navigation";
import {CalendarList} from "react-native-calendars";
import {AppContainer, toDateTime, toDateString, randomColor, Dropdown, MoreButton} from "./util";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

//stores all clients/events/venues loaded from the database, to prevent unnecessary db calls
let loadedData = {
    clients: null,
    events: null,
    venues: null
};

class LoadingScreen extends React.Component {
    componentWillMount() {
        Promise.all([db.getClients(), db.getEvents(), db.getVenues()]).then(values => {
            loadedData.clients = values[0];
            loadedData.events = values[1];
            loadedData.venues = values[2];

            this.props.navigation.navigate("App", loadedData);
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

        this.state = {
            selectedVenue: loadedData.venues[0]
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
                    horizontal = {Platform.OS === "android"}
                    pagingEnabled = {Platform.OS === "android"}
                    hideArrows = {Platform.OS !== "android"}
                    markingType = "multi-dot"
                    markedDates = {this._generateMarkedDates()}
                    onDayPress = {day => {
                      this.props.navigation.navigate("Day", {
                          selectedDate: toDateTime({date: day.dateString}),
                          selectedVenue: this.state.selectedVenue,
                          loadedData: loadedData,
                          database: db
                      });
                    }}
                />
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
    Loading: LoadingScreen,
    App: AppStack
}, {
    initialRouteName: "Loading",
    headerMode: "none"
}));
