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
        messageOptions.from = "Music Matters Bookings";

        gmail.sendMail(messageOptions).then(res).catch(rej);
    });
};
exports.sendEmail = sendEmail;

exports.sendArtistConfirmation = function (client, event, venue, acPDF) {
    let emailSubject = venue.name + " - Artist Confirmation";
    let emailBody = "Hello!\n\n" +
        "Attached is your confirmation for your performance" + " at " + venue.name + " at " + Util.toAMPM(event.start) + "\n" +
        "Please don't hesitate to reply back to this email if you have any questions.";

    return sendEmail({
        to: "lmoowelton@gmail.com",
        subject: emailSubject,
        text: emailBody,
        attachments: [
            {
                filename: "Confirmation " + event.date + ".pdf",
                content: acPDF
            }
        ]
    });
};

exports.sendInvoice = function (client, event, venue, invoicePDF) {
    let emailSubject = client.stage + " - Invoice - " + Util.toUS(event.date);
    let emailBody = "To whom it may concern,\n\n" +
        "Attached is the invoice for " + client.stage + ", who is performing at your venue on " + Util.toUSText(event.date) + ". " +
        "Please don't hesitate to reply back to this email if you have any questions.";

    return sendEmail({
        to: "lmoowelton@gmail.com",
        subject: emailSubject,
        text: emailBody,
        attachments: [
            {
                filename: "Invoice " + client.stage + " " + event.date + ".pdf",
                content: invoicePDF
            }
        ]
    });
};

exports.sendCalendar = function (month, year, venue, calendarPDF) {
    let monthText = Util.monthEnum(month);

    let emailSubject = "Booking Calendar for " + monthText + " " + year;
    let emailBody = "To whom it may concern,\n\n" +
        "Attached is the booking calendar for " + month + " " + year + ". " +
        "Please don't hesitate to reply back to this email if you have any questions.";

    return sendEmail({
        to: "lmoowelton@gmail.com",
        subject: emailSubject,
        text: emailBody,
        attachments: [
            {
                filename: "Booking Calendar " + monthText + " " + year + ".pdf",
                content: calendarPDF
            }
        ]
    })
};