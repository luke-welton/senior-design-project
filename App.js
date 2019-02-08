import React from 'react';
import {View, ActivityIndicator} from 'react-native'
import MonthView from "./MonthView"
import DayView from "./DayView"
import EventView from "./EventView"
import Styles from "./styles"

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clients: [],
            events: [],
            venues: [],
            currentVenue: null,
            selectedDate: null,
            selectedEvent: null

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
