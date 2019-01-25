import React from 'react';
import { Calendar } from 'react-native-calendars';
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
            events: null
        };

        db.getClients().then(clients => {
            this.setState({
                clients: clients
            });
        }).catch(err => console.log(err));

        db.getEvents().then(events => {
            this.setState({
                events: events
            })
        }).catch(err => console.log(err));
    }

    render() {
        return <Calendar/>
        //
        //
        // if (this.state.clients === null) {
        //     return (
        //         <View style={styles.container}>
        //             <Text>Loading data...</Text>
        //         </View>
        //     );
        // } else {
        //     return (
        //         <View style={styles.container}>
        //             <Text>{this.state.clients.toString()}</Text>
        //         </View>
        //     );
        // }
    };
}
//
// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//         alignItems: 'center',
//         justifyContent: 'center',
//     },
// });
