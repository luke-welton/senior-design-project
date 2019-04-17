import {toTimeString, toDateString, toDateTime, dayInMS, toMonthString} from "./util";

export class Client {
    constructor(_data, _id) {
        if (!_id) _id = null;
        if (!_data) _data = {};
        this.id = _id;

        this.performers = _data.performers;
        this.stageName = _data.stage;
        this.email = _data.email;
        this.splitCheck = _data.splitCheck;
    }

    update(data) {
        this.performers = data.performers || this.performers;
        this.stageName = data.stageName || this.stageName;
        this.email = data.email || this.email;
        this.splitCheck = data.splitCheck || false;
    }

    toData() {
        return {
            performers: this.performers || [],
            stage: this.stageName || "",
            email: this.email || "",
            splitCheck: this.splitCheck || false
        };
    }
}

export class Event {
    constructor(_data, _id) {
        if (!_id) _id = null;
        if (!_data) _data = {
            price: 0.00,
            date: toDateString(new Date()),
            month: toMonthString(new Date())
        };

        this.id = _id;
        this.clientID = _data.client;
        this.venueID = _data.venue;
        this.price = parseFloat(_data.price || 0);

        this.start = toDateTime({
            date: _data.date,
            time: _data.start
        });

        this.end = toDateTime({
            date: _data.date,
            time: _data.end
        });

        if (this.end < this.start) {
            this.end.setTime(this.end.getTime() + dayInMS);
        }
    }

    update(data) {
        if (!data) return;

        this.clientID = data.clientID || this.clientID;
        this.venueID = data.venueID || this.venueID;
        this.price = parseFloat(data.price || this.price);

        if (data.start) this.start = data.start;
        if (data.end) this.end = data.end;

        if (data.date) {
            this.month = toMonthString(toDateTime(data.date));
            let splits = data.date.split("-");
            this.start.setFullYear(splits[0], splits[1] -1, splits[2]);
            this.end.setFullYear(splits[0], splits[1] - 1, splits[2]);
        }
        if (data.startTime) {
            let splits = data.startTime.split(":");
            this.start.setHours(splits[0], splits[1]);
        }
        if (data.endTime) {
            let splits = data.endTime.split(":");
            this.end.setHours(splits[0], splits[1]);
        }

        if (this.end < this.start) {
            this.end.setMilliseconds(this.end.getTime() + dayInMS);
        }
    }


    toData() {
        return {
            date: toDateString(this.start),
            month: toMonthString(this.start),
            start: toTimeString(this.start),
            end: toTimeString(this.end),
            client: this.clientID || "",
            venue: this.venueID || "",
            price: this.price || 0
        };
    }

    isEqual(other) {
        return this.id === other.id &&
               this.clientID === other.clientID &&
               this.venueID === other.venueID &&
               this.start.getTime() === other.start.getTime() &&
               this.end.getTime() === other.start.getTime();
    }
}

export class Venue {
    constructor(_data, _id) {
        if (!_data) _data = {};
        this.id = _id || null;
        this.name = _data.name || "";
        this.contactEmail = _data.email || "";
        this.address = _data.address || {};
    }

    update(data) {
        this.name = data.name || this.name;
        this.contactEmail = data.email || this.contactEmail;
        this.address = {
            street1: data.street1 || this.address.street1,
            street2: data.street2 || this.address.street2,
            city: data.city || this.address.city,
            state: data.state || this.address.state,
            zip: (data.zip || this.address.zip).toString()
        };
    }

    toData() {
        return {
            name: this.name,
            email: this.contactEmail,
            address: this.address
        };
    }
}
