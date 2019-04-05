const Functions = require('firebase-functions');
const NodeMailer = require("nodemailer");
const Util = require("./util.js");

const env = Functions.config();
const gmail = NodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: env.gmail.email,
        pass: env.gmail.password
    }
});

const sendEmail = function (info) {
    return new Promise((res, rej) => {
        if (!info.to) {
            rej("No receivers were specified.");
        }

        let messageOptions = Object.assign({}, info);
        messageOptions.from = `"Luke Welton" <luke.welton97@gmail.com>`;

        gmail.sendMail(messageOptions).then(() => res());
    });
};

exports.sendArtistConfirmation = function (client, event, venue, acPDF) {
    return new Promise ((res, rej) => {
        let emailSubject = venue.name + " - Artist Confirmation";
        let emailBody = "Hello!\n\n" +
            "Attached is your confirmation for your performance" + " at " + venue.name + " at " + Util.toAMPM(event.start) + "\n" +
            "Please don't hesitate to reply back to this email if you have any questions.\n\n";

        sendEmail({
            to: "law0047@auburn.edu",
            cc: "lmoowelton@gmail.com",
            bcc: "lawelton42@yahoo.com",
            subject: emailSubject,
            text: emailBody,
            attachments: [
                {
                    filename: "Confirmation " + event.date + ".pdf",
                    content: acPDF
                }
            ]
        }).then(() => res).catch(err => rej(err));
    });
};

exports.sendEmail = sendEmail;