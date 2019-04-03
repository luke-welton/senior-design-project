const Functions = require('firebase-functions');
const NodeMailer = require("nodemailer");

const env = Functions.config();
const gmail = NodeMailer.createTransport({
    service: "gmail",
    auth: {
        user: env.gmail.email,
        pass: env.gmail.password
    }
});

exports.sendEmail = function (info) {
    return new Promise((res, rej) => {
        if (!info.to) {
            rej("No receivers were specified.");
        }

        let messageOptions = Object.assign({}, info);
        messageOptions.from = `"Luke Welton" <luke.welton97@gmail.com>`;

        gmail.sendMail(messageOptions);
    });
};