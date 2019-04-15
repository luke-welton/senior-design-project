import Firebase from 'firebase';
import { Client, Event, Venue } from "./objects";
import {toMonthString} from "./util";

require("firebase/functions");

export default class Database {
    constructor() {
        this.db = Firebase.database();
        this.func = Firebase.functions();

        this.clientDB = this.db.ref("database/clients");
        this.eventDB = this.db.ref("database/events");
        this.venueDB = this.db.ref("database/venues");

        this.sendAllForms = this.func.httpsCallable("sendAll");
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

    // // load information for all events
    // // this probably should not be used too much bc there will presumably be a lot of these
    // getEvents(options) {
    //     if (!options) {
    //         options = {}
    //     }
    //
    //     return new Promise((res, rej) => {
    //         this.eventDB.once("value").then(data => {
    //             let _events = data.val();
    //             let foundEvents = [];
    //
    //             for (let eventID in _events) {
    //                 if (_events.hasOwnProperty(eventID)) {
    //                     let eventObj = new Event(_events[eventID], eventID);
    //                     foundEvents.push(eventObj);
    //                 }
    //             }
    //
    //             res(foundEvents);
    //         }).catch(err => rej(err));
    //     });
    // }

    // Load all events for the current month and onwards.
    // Assumption: Limited, since events should not be scheduled more than a few months in advance.
    getCurrentMonthAndUpcomingEvents(options) {
        if (!options) {
            options = Date.now();
        }

        let archiveDate = new Date(options);

        let currentMonth = toMonthString(archiveDate);

        return new Promise((res, rej) => {
            Firebase.database().ref('database/events').orderByChild('month').startAt(currentMonth).once("value").then(data => {
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

    // Load all of the events for a given month.
    getMonthEvents(options) {
        if (!options) {
            options = Date.now();
        }

        let archiveDate = new Date(options);

        let archiveMonth = toMonthString(archiveDate);

        return new Promise((res, rej) => {
            Firebase.database().ref('database/events').orderByChild('month').equalTo(archiveMonth).once("value").then(data => {
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
       let clientRef = this.clientDB.child(_client.id);
       return clientRef.update(_client.toData());
    }

    removeClient(_client) {
        let clientRef = this.clientDB.child(_client.id);
        return clientRef.remove();
    }

    addEvent(_event) {
        return new Promise((res, rej) => {
            let eventRef = this.eventDB.push(_event.toData());
            _event.id = eventRef.key;
            res()
        });
    }

    updateEvent(_event) {
        let eventRef = this.eventDB.child(_event.id);
        return eventRef.update(_event.toData());
    }

    removeEvent(_event) {
        let eventRef = this.eventDB.child(_event.id);
        return eventRef.remove();
    }

    addVenue(_venue) {
        return new Promise((res, rej) => {
            let venueRef = this.venueDB.push(_venue.toData());
            _venue.id = venueRef.key;
            res();
        });
    }

    updateVenue(_venue) {
        let venueRef = this.venueDB.child(_venue.id);
        return venueRef.update(_venue.toData());
    }

    removeVenue(_venue) {
        let venueRef = this.venueDB.child(_venue.id);
        return venueRef.remove();
    }

    sendForms(venue, date) {
        return new Promise((res, rej) => {
            this.sendAllForms({
                venue: venue.id,
                month: date.getMonth() + 1,
                year: date.getFullYear()
            }).then(response => {
                if (response.error) {
                    rej(response.error);
                } else {
                    res();
                }
            }).catch(err =>  {
                rej(err.message)
            });
        });
    }
}
