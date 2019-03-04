import React from 'react';
import {ActivityIndicator, Picker, Platform} from 'react-native';
import DayView from "./DayView";
import EventView from "./EventView";
import db from "./database";
import Styles from "./styles";
import {Venue} from "./objects";
import {createStackNavigator, createAppContainer, createSwitchNavigator} from "react-navigation";
import {CalendarList} from "react-native-calendars";
import {AppContainer, toDateTime, toDateString, randomColor} from "./util";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

const genericVenues = [
    new Venue("aaa", "Venue A"),
    new Venue("bbb", "Venue B"),
    new Venue("ccc", "Venue C")
];

//stores all clients/events/venues loaded from the database, to prevent unnecessary db calls
let loadedData = {
    clients: null,
    events: null,
    venues: null
};

class LoadingScreen extends React.Component {
    componentWillMount() {
        let loadVenues = Promise.resolve(genericVenues);

        Promise.all([db.getClients(), db.getEvents(), loadVenues]).then(values => {
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
            venue: loadedData.venues[0]
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

        let filteredEvents = loadedData.events.filter(event => event.venueID === this.state.venue.id);
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
                <Picker
                    selectedValue = {this.state.venue.id}
                    onValueChange = {value =>
                        this.setState({venue: loadedData.venues.find(venue => venue.id === value)})
                    }
                >
                    {loadedData.venues.map(venue =>
                        <Picker.Item label={venue.name} value={venue.id} key={venue.id} />
                    )}
                </Picker>
                <CalendarList style={Styles.monthView}
                    horizontal = {Platform.OS === "android"}
                    pagingEnabled = {Platform.OS === "android"}
                    hideArrows = {Platform.OS !== "android"}
                    markingType = "multi-dot"
                    markedDates = {this._generateMarkedDates()}
                    onDayPress = {day => {
                      this.props.navigation.navigate("Day", {
                          selectedDate: toDateTime({date: day.dateString}),
                          selectedVenue: this.state.venue,
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
    Event: EventView
}, {
    initialRouteName: "Month",
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
