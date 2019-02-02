import React from 'react';
import { CalendarList } from 'react-native-calendars';
import { View, Text, Picker } from 'react-native';
import Styles from "./styles.js";
import db from "./database.js";

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
            venue: 1
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
        return (
            <View style={Styles.appContainer}>
                <Text style={Styles.statusBar}> </Text>
                <Picker style={Styles.calPicker}
                        selectedValue={this.state.venue.toString()}
                        onValueChange={(value) => {
                            this.setState({venue: parseInt(value)});
                        }}
                >
                    <Picker.Item label="Venue A" value="1" />
                    <Picker.Item label="Venue B" value="2" />
                    <Picker.Item label="Venue C" value="3" />
                </Picker>
                <CalendarList style={Styles.calendar} />
            </View>
        );
    };
}
