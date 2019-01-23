import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Client, Event} from "./objects.js";
import db from "./database";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clients: null,
            events: null
        };

        db.getClients(clients => {
            this.setState({
                clients: clients
            });
        });

        db.getEvents(events => {
            this.setState({
                events: events
            })
        })
    }

    render() {
        if (this.state.clients === null) {
            return (
                <View style={styles.container}>
                    <Text>Loading data...</Text>
                </View>
            )
        } else {
            return (
                <View style={styles.container}>
                    <Text>{this.state.clients.toString()}</Text>
                </View>
            );
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
