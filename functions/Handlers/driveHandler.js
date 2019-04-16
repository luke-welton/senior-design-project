const {google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const folderIDs = require("../folders.json");
const Functions = require("firebase-functions");
const Util = require("../util.js");

const env = Functions.config();
const {client_id, client_secret, redirect_uris} = env.drive.web;
const oAuthClient = new OAuth2(client_id, client_secret, redirect_uris[0]);
oAuthClient.setCredentials({
    refresh_token: env.drive.refresh_token
});

const Drive = google.drive({
    version: "v3",
    auth: oAuthClient
});

const getMatchingFolder = function (options) {
    let queryParams = [];
    queryParams.push("mimeType='application/vnd.google-apps.folder'");

    if (options.id) {
        queryParams.push("id = '" + options.id + "'");
    }

    if (options.name) {
        queryParams.push("name = '" + options.name + "'");
    }

    if (options.parents) {
        options.parents.forEach(id => {
            queryParams.push("'" + id + "'" + " in parents");
        });
    }

    if (!options.searchTrash) {
        queryParams.push("not trashed");
    }

    return new Promise((res, rej) => {
        Drive.files.list({
            q: queryParams.join(" and ")
        }).then(response => {
            if (response.data.files.length < 1) {
                createFolder(options.name, options).then(response => {
                    res(response.data);
                }).catch(rej);
            } else {
                res(response.data.files[0]);
            }
        }).catch(rej);
    });
};

const createFolder = function (name, options) {
    return new Promise((res, rej) => {
        let folderInfo = {
            name: name,
            mimeType: "application/vnd.google-apps.folder"
        };

        if (options.parents) {
            folderInfo.parents = options.parents;
        }

        Drive.files.create({
            resource: folderInfo
        }).then(folder => {
            res(folder);
        }).catch(rej);
    });
};

const uploadPDF = function (name, pdf, options) {
    let fileInfo = {
        name: name,
        mimeType: "application/pdf"
    };

    if (options.parents) {
        fileInfo.parents = options.parents;
    }

    return Drive.files.create({
        resource: fileInfo,
        media: {
            mimeType: "application/pdf",
            body: pdf
        }
    });
};

exports.uploadArtistConfirmation = function (event, client, pdf) {
    return new Promise((res, rej) => {
        let eventDate = new Date(event.date);
        let folderName = [Util.monthEnum(eventDate.getMonth()), eventDate.getFullYear()].join(" ");

        getMatchingFolder({
            name: folderName,
            parents: [folderIDs.artist_confirmation]
        }).then(folder => {
            let fileName = [event.date, client.stage].join(" ") + ".pdf";

            uploadPDF(fileName, pdf, {
                parents: [folder.id]
            }).then(res).catch(rej);
        }).catch(rej);
    });
};

exports.uploadInvoice = function (event, client, pdf) {
    return new Promise((res, rej) => {
        let eventDate = new Date(event.date);
        let folderName = [Util.monthEnum(eventDate.getMonth()), eventDate.getFullYear()].join(" ");

        getMatchingFolder({
            name: folderName,
            parents: [folderIDs.invoice]
        }).then(folder => {
            let fileName = [event.date, client.stage].join(" ") + ".pdf";

            uploadPDF(fileName, pdf, {
                parents: [folder.id]
            }).then(res).catch(rej);
        }).catch(rej);
    });
};

exports.uploadBookingList = function (venue, month, year, pdf) {
    return new Promise((res, rej) => {
        let folderName = [Util.monthEnum(month - 1), year].join(" ");

        getMatchingFolder({
            name: folderName,
            parents: [folderIDs.booking_list]
        }).then(folder => {
            let fileName = venue.name + ".pdf";

            uploadPDF(fileName, pdf, {
                parents: [folder.id]
            }).then(res).catch(rej);
        }).catch(rej);
    });
};

exports.uploadCalendar = function (venue, month, year, pdf) {
    return new Promise((res, rej) => {
        let folderName = [Util.monthEnum(month - 1), year].join(" ");

        getMatchingFolder({
            name: folderName,
            parents: [folderIDs.calendar]
        }).then(folder => {
            let fileName = venue.name + ".pdf";

            uploadPDF(fileName, pdf, {
                parents: [folder.id]
            }).then(res).catch(rej);
        }).catch(rej);
    });
};