const Functions = require('firebase-functions');
const Admin = require("firebase-admin");
const Email = require("./Handlers/emailHandler.js");
const PDF = require("./Handlers/pdfHandler.js");
const Drive = require("./Handlers/driveHandler.js");
const Util = require("./util.js");

// process.env = require("./.runtimeconfig.json");
// throw new Error(JSON.stringify(process.env.FIREBASE_CONFIG));

Admin.initializeApp();
const db = Admin.database();
const eventDB = db.ref("database/events");
const clientDB = db.ref("database/clients");
const venueDB = db.ref("database/venues");

// const validEmailTypes = ["booking_list", "invoice", "artist_confirmation", "calendar"];
// exports.sendEmail = Functions.https.onRequest((req, res) => {
//     const handleError = function (errorMessage) {
//         res.send(JSON.stringify({
//             error: errorMessage
//         }));
//     };
//
//     let emailType = req.query.type;
//     if (!emailType) {
//         handleError("No email type was specified.");
//     } else if (!validEmailTypes.includes(emailType)) {
//         handleError("The email type provided is invalid.");
//     } else {
//         if (emailType === "booking_list" || emailType === "calendar") {
//             processBookingListAndCalendar(req.query).then(data => {
//                 if (emailType === "calendar") {
//                     let calendarPDF = PDF.generateCalendar(data.month, data.year, data.events);
//                     Email.sendCalendar(data.month, data.year, data.venue, calendarPDF).then(() => {
//                         res.send(JSON.stringify({
//                             response: "Email successfully sent!",
//                             events: data.events
//                         }));
//                     }).catch(handleError);
//                 }
//                 if (emailType === "booking_list") {
//                     let calendarPDF = PDF.generateBookingList(data.month, data.year, data.events, data.venue);
//                     Email.sendBookingList(data.month, data.year, data.venue, calendarPDF).then(() => {
//                         res.send(JSON.stringify({
//                             response: "Email successfully sent!",
//                             events: data.events
//                         }));
//                     }).catch(handleError);
//                 }
//             }).catch(handleError);
//         } else {
//             processInvoiceAndArtistConfirmation(req.query).then(data => {
//                 if (emailType === "invoice") {
//                     let invoicePDF = PDF.generateInvoice(data.client, data.event, data.venue);
//                     Email.sendInvoice(data.client, data.event, data.venue, invoicePDF).then(() => {
//                         res.send(JSON.stringify({
//                             response: "Email successfully sent!"
//                         }));
//                     }).catch(handleError);
//                 } else {
//                     let artistConfirmationPDF = PDF.generateArtistConfirmation(data.client, data.event, data.venue);
//                     Email.sendArtistConfirmation(data.client, data.event, data.venue, artistConfirmationPDF).then(() => {
//                         res.send(JSON.stringify({
//                             response: "Email successfully sent!"
//                         }));
//                     }).catch(handleError);
//                 }
//             }).catch(handleError);
//         }
//     }
// });

exports.sendAll = Functions.https.onCall((data) => {
    return new Promise((res, rej) => {
        let handleError = function (errorMessage) {
            rej({
                error: errorMessage
            });
        };

        processBookingListAndCalendar(data).then(processedData => {
            let sendAllEmails = [];
            sendAllEmails.push(() => {
                let calendarPDF = PDF.generateCalendar(processedData.month, processedData.year, processedData.events);
                return Email.sendCalendar(processedData.month, processedData.year, processedData.venue, calendarPDF);
            });

            sendAllEmails.push(() => {
                let bookingListPDF = PDF.generateBookingList(processedData.month, processedData.year, processedData.events, processedData.venue);
                return Email.sendBookingList(processedData.month, processedData.year, processedData.venue, bookingListPDF);
            });

            processedData.events.forEach(event => {
                sendAllEmails.push(() => {
                    let invoicePDF = PDF.generateInvoice(event.client, event, processedData.venue);
                    return Email.sendInvoice(event.client, event, processedData.venue, invoicePDF);
                });
                sendAllEmails.push(() => {
                    let artistConfirmationPDF = PDF.generateArtistConfirmation(event.client, event, processedData.venue);

                    return Drive.uploadArtistConfirmation(event, event.client, artistConfirmationPDF);

                    // return Email.sendArtistConfirmation(event.client, event, processedData.venue, artistConfirmationPDF);
                });
            });

            Util.staggerPromises(sendAllEmails, 0, 10).catch(handleError);
            res({
                success: true
            });
        }).catch(handleError);
    });
});

exports.sendAllReq = Functions.https.onRequest((req, res) => {
    let handleError = function (errorMessage) {
        res.send({
            error: errorMessage
        });
    };

    processBookingListAndCalendar(req.query).then(processedData => {
        let uploadToDrive = [];
        uploadToDrive.push(() => {
            let calendarPDF = PDF.generateCalendar(processedData.month, processedData.year, processedData.events);
            return Drive.uploadCalendar(processedData.venue, processedData.month, processedData.year, calendarPDF);
        });
        uploadToDrive.push(() => {
            let bookingListPDF = PDF.generateBookingList(processedData.month, processedData.year, processedData.events, processedData.venue);
            return Drive.uploadBookingList(processedData.venue, processedData.month, processedData.year, bookingListPDF);
        });

        processedData.events.forEach(event => {
            uploadToDrive.push(() => {
                let artistConfirmationPDF = PDF.generateArtistConfirmation(event.client, event, processedData.venue);
                return Drive.uploadArtistConfirmation(event, event.client, artistConfirmationPDF);
            });
            uploadToDrive.push(() => {
                let invoicePDF = PDF.generateInvoice(event.client, event, processedData.venue);
                return Drive.uploadInvoice(event, event.client, invoicePDF);
            });
        });

        Util.staggerPromises(uploadToDrive, 0, 1).then(() => {
            res.send({
                success: true
            });
        }).catch(handleError);
    }).catch(handleError);
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

                eventDB.orderByChild("month").equalTo(Util.toMonthString(month, year)).once("value").then(data => {
                    let eventArray = Util.objectToArray(data.val());
                    let filteredEvents = eventArray.filter(event => event.venue === venueID);

                    attachClientData(filteredEvents).then(events => {
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
    let clientFetches = events.map(event => {
        let clientID = event.client;

        return new Promise((res, rej) => {
            clientDB.child(clientID).once("value").then(data => {
                event.client = data.val();
                res(event);
            }).catch(rej);
        });
    });

    return Promise.all(clientFetches);
};

// const processInvoiceAndArtistConfirmation = function (args) {
//     return new Promise((res, rej) => {
//         let eventID = args.event;
//         if (!eventID) {
//             rej("No event ID was specified.");
//         }
//
//         eventDB.child(eventID).once("value").then(data => {
//             if (!data.exists()) {
//                 rej("No event was found with the given ID.");
//             } else {
//                 let eventData = data.val();
//
//                 let findMatchingClient = clientDB.child(eventData.client).once("value");
//                 let findMatchingVenue = venueDB.child(eventData.venue).once("value");
//
//                 Promise.all([findMatchingClient, findMatchingVenue]).then(data => {
//                     let clientData = data[0].val();
//                     let venueData = data[1].val();
//
//                     res({
//                         client: clientData,
//                         event: eventData,
//                         venue: venueData
//                     });
//                 }).catch(rej)
//             }
//         }).catch(rej);
//     });
// };