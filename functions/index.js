const Functions = require('firebase-functions');
const Admin = require("firebase-admin");
const Email = require("./emailHandler.js");
const PDF = require("./pdfHandler.js");

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

const validEmailTypes = ["booking_list", "invoice", "artist_confirmation"];
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
        if (emailType === "booking_list") {
            processBookingList(req.query);
        } else {
            processInvoiceAndArtistConfirmation(req.query).then(data => {
                if (emailType === "invoice") {
                    let invoicePDF = PDF.generateInvoice(data.client, data.event, data.venue);
                    //send invoice email
                } else {
                    let artistConfirmationPDF = PDF.generateArtistConfirmation(data.client, data.event, data.venue);
                    Email.sendArtistConfirmation(data.client, data.event, data.venue, artistConfirmationPDF).then(() => {
                        res.send("Email successfully sent!");
                    }).catch(handleError);
                }
            }).catch(handleError);
        }
    }
});

const processBookingList = function (args) {
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