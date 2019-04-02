const functions = require('firebase-functions');
const nodemailer = require("nodemailer");

const env = functions.config();
const mailTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: env.gmail.email,
        pass: env.gmail.password
    }
});

const testOptions = {
    from: "luke.welton97@gmail.com",
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