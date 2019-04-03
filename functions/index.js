const functions = require('firebase-functions');
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const Objects = require("./objects");

admin.initializeApp();

const env = functions.config();
const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.gmail.email,
        pass: env.gmail.password
    }
});

const testOptions = {
    from: `"Luke Welton" <luke.welton97@gmail.com>`,
    to: "lmoowelton@gmail.com"
};

exports.emailTest = functions.https.onRequest((req, res) => {
    let mailOptions = Object.assign({}, testOptions);
    mailOptions.subject = "Test Email";
    mailOptions.text = "Hey Luke!\n\nThis is the new email!\n\nThanks,\nLuke Welton";

    return mailTransport.sendMail(mailOptions).then(() => {
        res.send("Successfully sent email!");
    }).catch(err => console.log(err));
});

exports.databaseTest = functions.https.onRequest((req, res) => {
    let clientID = req.query.clientID;

    return admin.database().ref("database/clients/" + clientID).once("value").then(data => {
        let client = new Objects.Client(data.val(), clientID);
        res.send(JSON.stringify(client.toData()));
    }).catch(err => console.error("An error occured.", err))
});