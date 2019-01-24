export function toDateString(date) {
    return [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/");
}

export function toTimeString(time) {
    return [time.getUTCHours(), time.getUTCMinutes()].join(":");
}

export function toDateTime(data) {
    let returnDateTime = new Date();

    if (data.date) {
        let splits = data.date.split("/");
        returnDateTime.setFullYear(splits[2], splits[0] - 1, splits[1]);
    }
    if (data.time) {
        let splits = data.time.split(":");
        returnDateTime.setHours(splits[0], splits[1], 0, 0);
    } else {
        returnDateTime.setHours(0, 0, 0, 0);
    }

    return returnDateTime;
}

let dayInMS = 24 * 60 * 60 * 1000;
export { dayInMS };