/*
    The regular util.js we have is designed with import/exports in mind,
    which Node doesn't support, so we can't use that for our Cloud Functions.
 */

exports.toAMPM = function (militaryTime) {
    let splits = militaryTime.split(":");

    let ampm = "AM";
    let hour = parseInt(splits[0]);

    if (hour === 12 || hour === 0) {
        splits[0] = "12";
        ampm = hour === 12 ? "PM" : "AM";
    } else if (hour > 12) {
        splits[0] = (hour - 12).toString();
        ampm = "PM";
    }

    return [splits.join(":"), ampm].join(" ");
};

exports.toUS = function (isoDate) {
    let splits = isoDate.split("-");

    let year = splits[0];
    let month = splits[1];
    let date = splits[2];

    //remove trailing 0s
    if (parseInt(month) < 10) {
        month = month[1];
    }
    if (parseInt(date) < 10) {
        date = date[1];
    }

    return [month, date, year].join("/");
};

exports.toUSText = function (isoDate) {
    let splits = isoDate.split("-");
    let year = splits[0];
    let month = parseInt(splits[1]);
    let date = splits[2];

    let monthText = exports.monthEnum(month - 1);

    return monthText + " " + date + ", " + year;
};

exports.monthEnum = function (monthNum) {
    switch (monthNum) {
        case 0: return "January";
        case 1: return "February";
        case 2: return "March";
        case 3: return "April";
        case 4: return "May";
        case 5: return "June";
        case 6: return "July";
        case 7: return "August";
        case 8: return "September";
        case 9: return "October";
        case 10: return "November";
        case 11: return "December";
    }
};

exports.dayEnum = function (dayNum) {
    switch (dayNum) {
        case 0: return "Sunday";
        case 1: return "Monday";
        case 2: return "Tuesday";
        case 3: return "Wednesday";
        case 4: return "Thursday";
        case 5: return "Friday";
        case 6: return "Saturday";
    }
};

let updateDateTime = function (date, timestring) {
    let timeSplit = timestring.split(":");
    date.setHours(timeSplit[0]);
    date.setMinutes(timeSplit[1]);
};

exports.eventSort = function (eventA, eventB) {
    let dateA = new Date(eventA.date);
    let dateB = new Date(eventB.date);

    if (dateA.getTime() === dateB.getTime()) {
        updateDateTime(dateA, eventA.start);
        updateDateTime(dateB, eventB.start);
    }

    return dateA.getTime() - dateB.getTime();
};

exports.objectToArray = function (object) {
    let returnArray = [];

    for (let key in object) {
        if (object.hasOwnProperty(key)) {
            let toAdd = object[key];
            toAdd.id = key;
            returnArray.push(toAdd);
        }
    }

    return returnArray;
};

exports.toMonthString = function (month, year) {
    if (month < 10) {
        month = "0" + month;
    }

    return [month, year].join("-");
};

/**
 * This is primarily used for the sendAll function,
 * as Gmail throws an error if you send too many emails in a short enough timeframe.
 * I've still included it here in case it could be useful in other scenarios.
 *
 * @param {Array<Promise>} promises - the promises to stagger
 * @param {Number} timing - how many ms apart each promise should be staggered
 * @returns {Promise} - Resolves when all promises are completed, rejects if any fail
 */
exports.staggerPromises = function (promises, timing) {
    return new Promise((res, rej) => {
        let shouldRes = true;

        promises.forEach(async promise => {
            if (shouldRes) {
                await promise().then(() => {
                    setTimeout(() => Promise.resolve(), timing);
                }).catch(err => {
                    shouldRes = false;
                    rej(err);
                });
            }
        });

        if (shouldRes) res();
    });
};