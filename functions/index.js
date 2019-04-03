const Functions = require('firebase-functions');
const Admin = require("firebase-admin");
const Email = require("./emailHandler.js");
const PDF = require("./pdfHandler.js");
const Util = require("./util.js");

Admin.initializeApp();

exports.emailTest = Functions.https.onRequest((req, res) => {
    return Email.sendEmail({
        subject: "Test Email",
        text: "Hey Luke!\n\nThis is the new email!\n\nThanks,\nLuke Welton"
    }).then(() => res.send("Email successfully sent!")).catch(err => console.error(err));
});

const db = Admin.database();
const eventDB = db.ref("database/events");
const clientDB = db.ref("database/clients");
const venueDB = db.ref("database/venues");

exports.sendArtistConfirmation = Functions.https.onRequest((req, res) => {
    let eventID = req.query.event;

    return eventDB.child(eventID).once("value").then(data => {
        if (data.exists()) {
            let event = data.val();

            let findMatchingClient = clientDB.child(event.client).once("value");
            let findMatchingVenue = venueDB.child(event.venue).once("value");

            Promise.all([findMatchingClient, findMatchingVenue]).then(data => {
                let client = data[0].val();
                let venue = data[1].val();

                let acPDF = PDF.generateArtistConfirmation(client, event, venue);
                let emailSubject = venue.name + " - Artist Confirmation";
                let emailBody = "Hello!\n\n" +
                                "Attached is your confirmation for your performance" + " at " + venue.name + " at " + Util.toAMPM(event.start) + "\n" +
                                "Please don't hesitate to reply back to this email if you have any questions.\n\n";

                Email.sendEmail({
                    to: "law0047@auburn.edu",
                    cc: "lmoowelton@gmail.com",
                    bcc: "lawelton42@yahoo.com",
                    subject: emailSubject,
                    text: emailBody,
                    attachments: [
                        {
                            filename: "Confirmation " + Util.toUS(event.date) + ".pdf",
                            content: acPDF
                        }
                    ]
                }).then(() => res.send("Email sent!").catch(err => console.error(err)));
            }).catch(err => console.error(err));
        } else {
            res.send("Error: No Client found with given ID.");
        }
    }).catch(err => console.error(err));
});