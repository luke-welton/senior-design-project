import React from 'react';
import {View, ActivityIndicator} from 'react-native'
import MonthView from "./MonthView"
import DayView from "./DayView"
import EventView from "./EventView"
import Styles from "./styles"
import {toDateTime} from "./util";
import {Event, Client, Venue} from "./objects";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

const genericClients = [
    new Client(0, {stage: "Luke Welton"}),
    new Client(1, {stage: "Stacey Henderson"}),
    new Client(2, {stage: "Rizwan Ibrahim"}),
    new Client(3, {stage: "Ciaira Hughes"}),
    new Client(4, {stage: "Jean-Luc Beaudette"})
];

const genericVenues = [
    new Venue(0, "Venue A"),
    new Venue(1, "Venue B"),
    new Venue(2, "Venue C")
];

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clients: genericClients,
            events: [],
            venues: genericVenues,
            currentVenue: "",
            selectedDate: toDateTime(),
            selectedEvent: new Event()

        };

        // commented out to avoid unnecessary db calls

        // db.getClients().then(clients => {
        //     this.setState({
        //         clients: clients
        //     });
        // }).catch(err => console.log(err));
        //
        // db.getEvents().then(events => {
        //     this.setState({
        //         events: events
        //     })
        // }).catch(err => console.log(err));
    }

    _initLoad() {
        //load clients
        //load events
        //load venues
        //set currentVenue to first venue
        this.setState({currentVenue: ""});
    }

    render() {
        if (this.state.currentVenue === null) {
            this._initLoad();
            return (
                <View style={Styles.appContainer}>
                    <ActivityIndicator size="large"/>
                </View>
            )
        } else {
            return (
                <EventView
                    event = {this.state.selectedEvent}
                    defaultVenue = {this.state.currentVenue}
                    defaultDate = {this.state.selectedDate}
                    clientList = {this.state.clients}
                    venueList = {this.state.venues}
                    eventList = {this.state.events}
                    onSave = {newEvent => {
                        this.state.events.push(newEvent);

                    }}
                    onClose={() => {
                    }}
                />
            );
            // if (this.state.selectedDate === null) {
            //     return (
            //         <MonthView
            //             venues = {genericVenues}
            //             onDateSelect={(date) => {
            //                 this.setState({selectedDate: date});
            //             }}
            //         />
            //     );
            // } else {
            //     return (
            //         <DayView selectedDate={this.state.selectedDate}
            //             onClose={() => {
            //                 this.setState({selectedDate: null});
            //             }}
            //         />
            //     );
            // }
        }
    };
}
