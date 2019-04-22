const Functions = require('firebase-functions');
const Admin = require("firebase-admin");
const Email = require("./handlers/emailHandler.js");
const PDF = require("./handlers/pdfHandler.js");
const Drive = require("./handlers/driveHandler.js");
const Util = require("./util.js");

Admin.initializeApp();
const db = Admin.database();
const eventDB = db.ref("database/events");
const clientDB = db.ref("database/clients");
const venueDB = db.ref("database/venues");

const VALID_TYPES = ["booking_list", "invoice", "artist_confirmation", "calendar"];
exports.generateDocument = Functions.https.onCall(data => new Promise((res, rej) => {
    const handleSuccess = () => res({success: true});
    const handleError = errorMessage => rej({error: errorMessage});

    let emailType = data.type;
    if (!emailType) {
        handleError("No email type was specified.");
    } else if (!VALID_TYPES.includes(emailType)) {
        handleError("The email type provided is invalid.");
    } else {
        if (emailType === "booking_list" || emailType === "calendar") {
            processBookingListAndCalendar(data).then(processedData => {
                if (emailType === "calendar") {
                    let calendarPDF = PDF.generateCalendar(processedData.month, processedData.year, processedData.events);

                    Promise.all([
                        Email.sendCalendar(processedData.month, processedData.year, processedData.venue, calendarPDF),
                        Drive.uploadCalendar(processedData.venue, processedData.month, processedData.year, calendarPDF)
                    ]).then(handleSuccess).catch(handleError);
                }
                if (emailType === "booking_list") {
                    let bookingListPDF = PDF.generateBookingList(processedData.month, processedData.year, processedData.events, processedData.venue);

                    Promise.all([
                        Email.sendBookingList(processedData.month, processedData.year, processedData.venue, bookingListPDF),
                        Drive.uploadBookingList(processedData.venue, processedData.month, processedData.year)
                    ]).then(handleSuccess).catch(handleError);
                }
            }).catch(handleError);
        } else {
            processInvoiceAndArtistConfirmation(data).then(processedData => {
                if (emailType === "invoice") {
                    let invoicePDF = PDF.generateInvoice(processedData.client, processedData.event, processedData.venue);

                    Promise.all([
                        Email.sendInvoice(processedData.client, processedData.event, processedData.venue, invoicePDF),
                        Drive.uploadInvoice(processedData.event, processedData.client, invoicePDF)
                    ]).then(handleSuccess).catch(handleError);
                } else {
                    let artistConfirmationPDF = PDF.generateArtistConfirmation(processedData.client, processedData.event, processedData.venue);

                    Promise.all([
                        Email.sendArtistConfirmation(processedData.client, processedData.event, processedData.venue, artistConfirmationPDF),
                        Drive.uploadArtistConfirmation(processedData.event, processedData.client, artistConfirmationPDF)
                    ]).then(handleSuccess).catch(handleError);
                }
            }).catch(handleError);
        }
    }
}));

exports.sendAll = Functions.https.onCall((data) => {
    return new Promise((res, rej) => {
        let handleError = function (errorMessage) {
            rej({
                error: errorMessage
            });
        };

        processBookingListAndCalendar(data).then(processedData => {
            let emailArray = [];
            let driveArray = [];

            let calendarPDF = PDF.generateCalendar(processedData.month, processedData.year, processedData.events);
            let bookingListPDF = PDF.generateBookingList(processedData.month, processedData.year, processedData.events, processedData.venue);

            emailArray.push(() => Email.sendCalendar(processedData.month, processedData.year, processedData.venue, calendarPDF));
            emailArray.push(() => Email.sendBookingList(processedData.month, processedData.year, processedData.venue, bookingListPDF));

            driveArray.push(() => Drive.uploadCalendar(processedData.venue, processedData.month, processedData.year, calendarPDF));
            driveArray.push(() => Drive.uploadBookingList(processedData.venue, processedData.month, processedData.year, bookingListPDF));

            processedData.events.forEach(event => {
                let artistConfirmationPDF = PDF.generateArtistConfirmation(event.client, event, processedData.venue);
                let invoicePDF = PDF.generateInvoice(event.client, event, processedData.venue);

                emailArray.push(() => Email.sendArtistConfirmation(event.client, event, processedData.venue, artistConfirmationPDF));
                emailArray.push(() => Email.sendInvoice(event.client, event, processedData.venue, invoicePDF));

                driveArray.push(() => Drive.uploadArtistConfirmation(event, event.client, artistConfirmationPDF));
                driveArray.push(() => Drive.uploadInvoice(event, event.client, invoicePDF));
            });

            Promise.all([
                Util.staggerPromises(emailArray, 0, 10),
                Util.staggerPromises(driveArray, 0, 1)
            ]).then(() => {
                res({success: true});
            }).catch(handleError);
        }).catch(handleError);
    });
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
