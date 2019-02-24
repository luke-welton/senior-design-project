import React from 'react';
import {View, ActivityIndicator} from 'react-native';
import MonthView from "./MonthView";
import DayView from "./DayView";
import EventView from "./EventView";
import db from "./database";
import Styles from "./styles";
import {Venue} from "./objects";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

const genericVenues = [
    new Venue(0, "Venue A"),
    new Venue(1, "Venue B"),
    new Venue(2, "Venue C")
];

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.clients = [];
        this.events = [];
        this.venues = [];

        this.state = {
            loaded: false,
            selectedVenue: null,
            selectedDate: null,
            selectedEvent: null
        };
    }

    _initLoad() {
        let loadVenues = Promise.resolve(genericVenues);

        Promise.all([db.getClients(), db.getEvents(), loadVenues]).then(values => {
            this.clients = values[0];
            this.events = values[1];
            this.venues = values[2];

            this.setState({
                loaded: true,
                selectedVenue: values[2][0]
            });
        }).catch(err => console.log(err));
    }

    render() {
        if (!this.state.loaded) {
            this._initLoad();
            return (
                <View style={Styles.appContainer}>
                    <ActivityIndicator size="large"/>
                </View>
            )
        } else {
            // return (
            //     <EventView
            //         event = {this.state.selectedEvent}
            //         defaultVenue = {this.state.selectedVenue}
            //         defaultDate = {this.state.selectedDate}
            //         clientList = {this.clients}
            //         venueList = {this.venues}
            //         eventList = {this.events}
            //         onSave = {newEvent => {
            //             db.addEvent(newEvent).catch(err => console.log(err));
            //             this.events.push(newEvent);
            //         }}
            //         onClose={() => {
            //         }}
            //     />
            // );
            if (this.state.selectedDate === null) {
                return (
                    <MonthView
                        venues = {genericVenues}
                        onDateSelect={date => {
                            this.setState({selectedDate: new Date(date)});
                        }}
                    />
                );
            } else {
                return (
                    <DayView selectedDate={this.state.selectedDate}
                        events={this.events}
                        onClose={() => {
                            this.setState({selectedDate: null});
                        }}
                    />
                );
            }
        }
    };
}
