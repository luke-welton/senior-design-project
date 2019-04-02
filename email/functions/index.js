const functions = require('firebase-functions');
const gmailKey = require("../../auth.json").gmailKey;

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendEmail = functions.https.onRequest((req, res) => {
    let address = decodeURIComponent(req.query.address);

    response.send("Address sent: " + address);
});
