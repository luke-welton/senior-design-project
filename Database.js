import Firebase from 'firebase';
import { Client, Event, Venue } from "./objects";
import {toDateString, toMonthString, dayInMS} from "./util"

export default class Database {
    constructor() {
        this.db = Firebase.database();
        this.clientDB = this.db.ref("database/clients");
        this.eventDB = this.db.ref("database/events");
        this.venueDB = this.db.ref("database/venues")
    }

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

    // Load an archived day of past events.
    getArchivedDayEvents(options) {
        if (!options) {
            options = Date.now();
        }

        let archiveDate = new Date(options);

        let archiveDay = toDateString(archiveDate);

        return new Promise((res, rej) => {
            Firebase.database().ref('database/events').orderByChild('date').equalTo(archiveDay).once("value").then(data => {
                let _events = data.val()
                let foundEvents = [];
                for (let eventID in _events) {
                    if (_events.hasOwnProperty(eventID)) {
                        let eventObj = new Event(_events[eventID], eventID);
                        foundEvents.push(eventObj);
                    }
                }
                res(foundEvents);
            }).catch(err => rej(err));
        })
    }

    // Load information for upcoming events and past events to the specified date.
    getPastAndUpcomingEvents(options) {
        if (!options) {
            options = Date.now();
        }

        let cutoffTime = options;
        let cutoffDate = new Date(cutoffTime);

        let cutoffString = toDateString(cutoffDate);

        return new Promise((res, rej) => {
            Firebase.database().ref('database/events').orderByChild('date').startAt(cutoffString).once("value").then(data => {
                let _events = data.val()
                let foundEvents = [];
                for (let eventID in _events) {
                    if (_events.hasOwnProperty(eventID)) {
                        let eventObj = new Event(_events[eventID], eventID);
                        foundEvents.push(eventObj);
                    }
                }
                res(foundEvents);
            }).catch(err => rej(err));
        })
    }
    // Load information for recent and upcoming events (The previous week and all future events).
    // Assumption: Limited, since events should not be scheduled more than a few months in advance.
    getRecentAndUpcomingEvents(options) {
        if (!options) {
            options = {}
        }

        let cutoffTime = Date.now() - (7 * (24 * 60 * 60 * 1000));
        let cutoffDate = new Date(cutoffTime);

        let cutoffString = toDateString(cutoffDate);

        return new Promise((res, rej) => {
            Firebase.database().ref('database/events').orderByChild('date').startAt(cutoffString).once("value").then(data => {
                let _events = data.val()
                let foundEvents = [];
                for (let eventID in _events) {
                    if (_events.hasOwnProperty(eventID)) {
                        let eventObj = new Event(_events[eventID], eventID);
                        foundEvents.push(eventObj);
                    }
                }
                res(foundEvents);
            }).catch(err => rej(err));
        })
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
