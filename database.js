import Firebase from 'firebase';
import auth from "./auth.json";
import { Client, Event, Venue } from "./objects";

class Database {
    constructor(config) {
        Firebase.initializeApp(config);

        this.db = Firebase.database();
        this.clientDB = this.db.ref("database/clients");
        this.eventDB = this.db.ref("database/events");
        this.venueDB = this.db.ref("database/venues")
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

    getVenues() {
            return new Promise((res, rej) => {
                this.venueDB.once("value").then(data => {
                    let _venues = data.val();
                    let venueList = [];

                    for (let venueID in _venues) {
                        if (_venues.hasOwnProperty(venueID)) {
                            let venueObj = new Venue(_venues[venueID], venueID);
                            venueList.push(venueObj);
                        }
                    }

                    res(venueList);
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
           clientRef.update(_client.toData())
               .then(() => res())
               .catch(() => rej());
        });
    }

    removeClient(_client) {
        return new Promise((res, rej) => {
            let clientRef = this.clientDB.child(_client.id);
            clientRef.remove()
                .then(() => res())
                .catch(() => rej());
        });
    }

    addEvent(_event) {
        return new Promise((res, rej) => {
            let eventRef = this.eventDB.push(_event.toData());
            _event.id = eventRef.key;
            res();
        });
    }

    updateEvent(_event) {
        return new Promise((res, rej) => {
            let eventRef = this.eventDB.child(_event.id);
            eventRef.update(_event.toData())
                .then(() => res())
                .catch(() => rej());
        });
    }

    removeEvent(_event) {
        return new Promise((res, rej) => {
            let eventRef = this.eventDB.child(_event.id);
            eventRef.delete()
                .then(() => res())
                .catch(() => rej());
        });
    }

    addVenue(_venue) {
        return new Promise((res, rej) => {
            let venueRef = this.venueDB.push(_venue.toData());
            _venue.id = venueRef.key;
            res();
        });
    }

    updateVenue(_venue) {
        return new Promise((res, rej) => {
            let venueRef = this.venueDB.child(_venue.id);
            venueRef.update(_venue.toData()).then(() => res()).catch(err => rej(err));
        });
    }

    removeVenue(_venue) {
        return new Promise((res, rej) => {
            let venueRef = this.venueDB.child(_venue.id);
            venueRef.remove().then(() => res()).catch(err => rej(err));
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
