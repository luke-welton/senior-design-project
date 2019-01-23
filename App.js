import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Firebase from 'firebase';
import auth from "./auth.json";
import {Client, Event} from "./objects.js";

// Firebase's implementation utilizes long timers,
// which React Native doesn't like and throws a warning,
// so this is here to ignore that.
console.ignoredYellowBox = ['Setting a timer'];

const firebaseConfig = {
  apiKey: auth.apiKey,
  authDomain: "music-matters-229420.firebaseapp.com",
  databaseURL: "https://music-matters-229420.firebaseio.com",
  storageBucket: "music-matters-229420.appspot.com"
};

Firebase.initializeApp(firebaseConfig);

const db = Firebase.database();
const clients = db.ref("clients");
const events = db.ref("events");

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clients: null,
            events: null
        };

        clients.on("value", data => {
            let _clients = data.val();
            let foundClients = [];

            for (let clientID in _clients) {
                if (_clients.hasOwnProperty(clientID)) {
                    let clientObj = new Client(clientID, _clients[clientID]);
                    foundClients.push(clientObj);
                }
            }

            console.log(foundClients);

            this.setState(() => ({
                clients: foundClients
            }));
        });
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
