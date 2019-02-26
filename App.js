import React from 'react';
import {View, ActivityIndicator, Picker, Platform} from 'react-native';
import DayView from "./DayView";
import EventView from "./EventView";
import db from "./database";
import Styles from "./styles";
import {Venue} from "./objects";
import {createStackNavigator, createAppContainer, createSwitchNavigator} from "react-navigation";
import {CalendarList} from "react-native-calendars";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

const genericVenues = [
    new Venue(0, "Venue A"),
    new Venue(1, "Venue B"),
    new Venue(2, "Venue C")
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

            this.props.navigation.navigate("App", loadedData).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }

    render() {
        return(
            <View style={Styles.appContainer}>
                <ActivityIndicator size="large"/>
            </View>
        );
    }
}

class MonthView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            venue: 1
        };
    }

    render() {
        return (
            <View style={[Styles.appContainer, Styles.monthView]}>
                <Picker style={Styles.calPicker}
                        selectedValue={this.state.venue.toString()}
                        onValueChange={(value) => {
                            this.setState({venue: parseInt(value)});
                        }}
                >
                    <Picker.Item label="Venue A" value="1"/>
                    <Picker.Item label="Venue B" value="2"/>
                    <Picker.Item label="Venue C" value="3"/>
                </Picker>
                <CalendarList style={Styles.monthView}
                              horizontal={Platform.OS === "android"}
                              pagingEnabled={Platform.OS === "android"}
                              hideArrows={Platform.OS !== "android"}
                              onDayPress={day => {
                                  this.props.navigation.navigate("Day", {selectedDate: day.dateString});
                              }}
                />
            </View>
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
