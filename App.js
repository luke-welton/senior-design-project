import React from 'react';
import MonthView from "./MonthView"
import DayView from "./DayView"

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clients: null,
            events: null,
            selectedDate: null
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

    render() {
        if (this.state.selectedDate === null) {
            return (
                <MonthView
                    onDateSelect={(date) => {
                        this.setState({selectedDate: date});
                    }}
                />
            );
        } else {
            return (
                <DayView selectedDate={this.state.selectedDate}
                    onClose={() => {
                        this.setState({selectedDate: null});
                    }}
                />
            );
        }
    };
}
