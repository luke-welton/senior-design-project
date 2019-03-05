import Firebase from 'firebase';
import auth from "./auth.json";
import { Client, Event } from "./objects";

export class Database {
    constructor(config) {
        Firebase.initializeApp(config);

        this.db = Firebase.database();
        this.clientDB = this.db.ref("database/clients");
        this.eventDB = this.db.ref("database/events");
    }

    // moveDB() {
    //     let newDB = this.db.ref("database");
    //     let newClientDB = newDB.child("clients");
    //     let newEventDB = newDB.child("events");
    //
    //     this.getClients().then(clients => {
    //         clients.forEach(client => {
    //             newClientDB.push(client.toData()).then(() => {
    //
    //             });
    //         });
    //     });
    //
    //     this.getEvents().then(events => {
    //         events.forEach(event => {
    //             newEventDB.push(event.toData()).then(() => {
    //
    //             });
    //         });
    //     })
    // }

    // fixEvents() {
    //     Promise.all([this.getClients(), this.getEvents()]).then(values => {
    //         let clients = values[0];
    //         let events = values[1];
    //
    //         events.forEach(event => {
    //             event.clientID = clients[Math.floor(Math.random() * clients.length)].id;
    //             this.updateEvent(event);
    //         });
    //     });
    // }

    // copyClientsAndEvents() {
    //     Promise.all([this.getClients(), this.getEvents()]).then(values => {
    //         let clients = values[0];
    //         let events = values[1];
    //         let combinedDB = this.db.ref("database/combined");
    //
    //         events.forEach(event => {
    //             let matchingClient = clients.find(client => client.id === event.clientID);
    //             let eventObj = event.toData();
    //
    //             delete eventObj.clientID;
    //             eventObj.client = matchingClient.toData();
    //
    //             combinedDB.child(event.id).set(eventObj).catch(err => console.log(err));
    //         });
    //     }).catch(err => console.log(err));
    //}

    // load information on all clients
    getClients() {
        return new Promise((res, rej) => {
            this.clientDB.once("value").then(data => {
                let _clients = data.val();
                let foundClients = [];

                for (let clientID in _clients) {
                    if (_clients.hasOwnProperty(clientID)) {
                        let clientObj = new Client(_clients[clientID], clientID);
                        foundClients.push(clientObj);
                    }
                }

                res(foundClients);
            }).catch(err => rej(err));
        });
    }

    // load information for all events
    // this probably should not be used too much bc there will presumably be a lot of these
    getEvents(options) {
        if (!options) {
            options = {}
        }

        //TODO: add in support for venue & time period within options

        return new Promise((res, rej) => {
            this.eventDB.once("value").then(data => {
                let _events = data.val();
                let foundEvents = [];

                for (let eventID in _events) {
                    if (_events.hasOwnProperty(eventID)) {
                        let eventObj = new Event(_events[eventID], eventID);
                        foundEvents.push(eventObj);
                    }
                }

                res(foundEvents);
            }).catch(err => rej(err));
        });
    }

    addClient(_client) {
        return new Promise((res, rej) => {
           let clientRef = this.clientDB.push(_client.toData());
           _client.id = clientRef.key;
           res();
        });
    }

    updateClient(_client) {
        return new Promise((res, rej) => {
           let clientRef = this.clientDB.child(_client.id);
           clientRef.update(_client.toData()).then(() => res()).catch(err => rej(err));
        });
    }

    removeClient(_client) {
        return new Promise((res, rej) => {
            let clientRef = this.clientDB.child(_client.id);
            clientRef.remove().then(() => res()).catch(err => rej(err));
        });
    }

    addEvent(_event) {
        return new Promise((res, rej) => {
            let eventRef = this.eventDB.push(_event.toData());
            _event.id = eventRef.key;

            //add this back in after Cycle 1
            //res()

            //remove everything below here after Cycle 1
            this.getClients().then(clients => {
                let matchingClient = clients.find(client => client.id === _event.clientID);
                let combinedData = _event.toData();
                combinedData.client = matchingClient.toData();

                this.db.ref("database/combined").child(_event.id).set(combinedData).then(() => res())
                    .catch(err => rej(err));
            }).catch(err => rej(err));
        });
    }

    updateEvent(_event) {
        return new Promise((res, rej) => {
            let eventRef = this.eventDB.child(_event.id);
            //add this back in after Cycle 1
            //eventRef.update(_event.toData()).then(() => res()).catch(err => rej(err));

            //remove everything below here after Cycle 1
            let combinedRef = this.db.ref("database/combined").child(_event.id);

            let updateEvent = new Promise((res, rej) => {
                eventRef.update(_event.toData()).then(() => res()).catch(err => rej(err));
            });

            let updateCombined = new Promise((res, rej) => {
                this.getClients().then(clients => {
                    let matchingClient = clients.find(client => client.id === _event.clientID);
                    let combinedData = _event.toData();
                    combinedData.client = matchingClient.toData();

                    combinedRef.set(combinedData).then(() => res()).catch(err => rej(err));
                }).catch(err => rej(err));
            });

            Promise.all([updateEvent, updateCombined]).then(() => res()).catch(err => rej(err));
        });
    }

    removeEvent(_event) {
        return new Promise((res, rej) => {
            let eventRef = this.eventDB.child(_event.id);
            //add this back in after Cycle 1
            //eventRef.remove().then(() => res()).catch(err => rej(err));

            //remove everything below here after Cycle 1
            let combinedRef = this.db.ref("database/combined").child(_event.id);

            Promise.all([eventRef.remove(), combinedRef.remove()]).then(() => res()).catch(err => rej(err));
        });
    }
}

const firebaseConfig = {
    apiKey: auth.apiKey,
    authDomain: "music-matters-229420.firebaseapp.com",
    databaseURL: "https://music-matters-229420.firebaseio.com",
    storageBucket: "music-matters-229420.appspot.com"
};
export default new Database(firebaseConfig);
