import React from "react";
import TinyColor from "tinycolor2";
import RandomColor from "randomcolor";

//handles converting a JS Date object into an ISO date string
export function toDateString(_date) {
    let year = _date.getFullYear();
    let month = _date.getMonth() + 1;
    let date = _date.getDate();

    //add trailing 0s
    if (month < 10) {
        month = "0" + month;
    }
    if (date < 10) {
        date = "0" + date;
    }

    return [year, month, date].join("-");
}

//handles converting a JS Date object into a "YYYY-MM" string
export function toMonthString(_date) {
    let year = _date.getFullYear();
    let month = _date.getMonth() + 1;

    //add trailing 0s
    if (month < 10) {
        month = "0" + month;
    }

    return [year, month].join("-");
}

//handles converting a JS date object into a time string
export function toTimeString(time) {
    let minutes = time.getMinutes();
    if (minutes < 10) {
        minutes = "0" + minutes;
    }

    return [time.getHours(), minutes].join(":");
}

//handles converting military time to AM/PM format
export function toAMPM(militaryTime) {
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
}

export function toMilitaryTime(ampmTime) {
    let splits = ampmTime.split(" ");
    let ampm = splits[1];

    splits = splits[0].split(":");

    let hour = parseInt(splits[0]);

    if (hour === 12 && ampm === "AM") {
        hour = 0;
    } else if (hour < 12 && ampm === "PM") {
        hour += 12;
    }

    return [hour, splits[1]].join(":");
}

//handles converting given options of date and/or time into a JS date object
export function toDateTime(data) {
    if (!data) data = {};

    let returnDateTime = new Date();

    if (data.date) {
        let toParse = data.date;
        if (data.date.includes("/")) {
            toParse = toISO(data.date);
        }

        let splits = toParse.split("-");
        returnDateTime.setFullYear(parseInt(splits[0]), parseInt(splits[1]) - 1, parseInt(splits[2]));
    }
    if (data.time) {
        let splits = data.time.split(":");
        returnDateTime.setHours(parseInt(splits[0]), parseInt(splits[1]), 0, 0);
    } else {
        returnDateTime.setHours(0, 0, 0, 0);
    }

    return returnDateTime;
}

//handles converting ISO date strings into US date strings
export function toUS(isoDate) {
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
}

//handles converting US date strings into ISO date strings
export function toISO(usDate) {
    let splits = usDate.split("/");

    let month = splits[0];
    let date = splits[1];
    let year = splits[2];

    //insert trailing 0s
    if (parseInt(month) < 10) {
        month = "0" + month;
    }
    if (parseInt(date) < 10) {
        date = "0" + date;
    }

    return [year, month, date].join("-");
}

//useful variable containing exactly how many milliseconds are in a day
let dayInMS = 24 * 60 * 60 * 1000;
export { dayInMS };

export function randomColor(seed) {
    let color = TinyColor(RandomColor({seed: seed}));
    return {
        hex: color.toHexString(),
        isDark: color.isDark()
    };
}
