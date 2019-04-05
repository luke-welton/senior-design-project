const Functions = require('firebase-functions');
const Admin = require("firebase-admin");
const Email = require("./emailHandler.js");
const PDF = require("./pdfHandler.js");
const Util = require("./util.js");

exports.emailTest = Functions.https.onRequest((req, res) => {
    return Email.sendEmail({
        to: "lmoowelton@gmail.com",
        subject: "Test Email",
        text: "Hey Luke!\n\nThis is the new email!\n\nThanks,\nLuke Welton"
    })
        .then(() => res.send("Email successfully sent!"))
        .catch(err => handleError(err, res));
});

Admin.initializeApp();
const db = Admin.database();
const eventDB = db.ref("database/events");
const clientDB = db.ref("database/clients");
const venueDB = db.ref("database/venues");

const validEmailTypes = ["booking_list", "invoice", "artist_confirmation", "calendar"];
exports.sendEmail = Functions.https.onRequest((req, res) => {
    const handleError = function (errorMessage) {
        res.send(JSON.stringify({
            error: errorMessage
        }));
    };

    let emailType = req.query.type;
    if (!emailType) {
        handleError("No email type was specified.");
    } else if (!validEmailTypes.includes(emailType)) {
        handleError("The email type provided is invalid.");
    } else {
        if (emailType === "booking_list" || emailType === "calendar") {
            processBookingListAndCalendar(req.query).then(data => {
                if (emailType === "calendar") {
                    let calendarPDF = PDF.generateCalendar(data.month, data.year, data.events);
                    Email.sendCalendar(data.month, data.year, data.venue, calendarPDF).then(() => {
                        res.send(JSON.stringify({
                            response: "Email successfully sent!"
                        }));
                    }).catch(handleError);
                }
            }).catch(handleError);
        } else {
            processInvoiceAndArtistConfirmation(req.query).then(data => {
                if (emailType === "invoice") {
                    let invoicePDF = PDF.generateInvoice(data.client, data.event, data.venue);
                    Email.sendInvoice(data.client, data.event, data.venue, invoicePDF).then(() => {
                        res.send(JSON.stringify({
                            response: "Email successfully sent!"
                        }));
                    }).catch(handleError);
                } else {
                    let artistConfirmationPDF = PDF.generateArtistConfirmation(data.client, data.event, data.venue);
                    Email.sendArtistConfirmation(data.client, data.event, data.venue, artistConfirmationPDF).then(() => {
                        res.send(JSON.stringify({
                            response: "Email successfully sent!"
                        }));
                    }).catch(handleError);
                }
            }).catch(handleError);
        }
    }
});

const processBookingListAndCalendar = function (args) {
    return new Promise((res, rej) => {
        let month = parseInt(args.month);
        let year = parseInt(args.year);
        let venueID = args.venue;

        if (!venueID) {
            rej("no venue ID was provided.");
        } else if (isNaN(month)) {
            rej("invalid month");
        } else if (year < 2000) {
            rej("invalid year");
        }

        venueDB.child(venueID).once("value").then(data => {
            if (!data.exists()) {
                rej("No venue was found with the given ID.")
            } else {
                let venue = data.val();

                eventDB.once("value").then(data => {
                    let eventArray = Util.objectToArray(data.val());

                    let filteredEvents = eventArray.filter(event => {
                        let eventDate = new Date(event.date);
                        return eventDate.getMonth() === month - 1 && eventDate.getFullYear() === year && event.venue === venue.id;
                    });

                    let getExtraInfo = attachClientData;
                    if (args.type === "calendar") {
                        getExtraInfo = events => Promise.resolve(events);
                    }

                    getExtraInfo(filteredEvents).then(events => {
                        res({
                            month: month,
                            year: year,
                            venue: venue,
                            events: events.sort(Util.eventSort)
                        });
                    }).catch(rej);
                }).catch(rej);
            }
        }).catch(rej);
    });
};

const attachClientData = function (events) {
    return new Promise((res, rej) => {
        let clientFetches = events.map(event => {
            let clientID = event.client;

            return new Promise((res, rej) => {
                clientDB.child(clientID).once("value").then(data => {
                    event.client = data.val();
                    res(event);
                }).catch(rej);
            });
        });

        Promise.all(clientFetches).then(res).catch(rej);
    });
};

const processInvoiceAndArtistConfirmation = function (args) {
    return new Promise((res, rej) => {
        let eventID = args.event;
        if (!eventID) {
            rej("No event ID was specified.");
        }

        eventDB.child(eventID).once("value").then(data => {
            if (!data.exists()) {
                rej("No event was found with the given ID.");
            } else {
                let eventData = data.val();

                let findMatchingClient = clientDB.child(eventData.client).once("value");
                let findMatchingVenue = venueDB.child(eventData.venue).once("value");

                Promise.all([findMatchingClient, findMatchingVenue]).then(data => {
                    let clientData = data[0].val();
                    let venueData = data[1].val();

                    res({
                        client: clientData,
                        event: eventData,
                        venue: venueData
                    });
                }).catch(rej)
            }
        }).catch(rej);
    });
};