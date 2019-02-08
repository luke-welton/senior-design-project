import {toTimeString, toDateString, toDateTime, dayInMS} from "./util";

export class Client {
    constructor(_id, _data) {
        if (!!_id) _id = null;
        if (!!_data) _data = {};

        this.id = _id;
        this.firstName = _data.first;
        this.lastName = _data.last;
        this.middleInitial = _data.middle;
        this.stageName = _data.stage || [_data.first, _data.last].join(" ");
        this.email = _data.email;
        this.phone = _data.phone;
    }

    toData() {
        return {
            first: this.firstName,
            last: this.lastName,
            middle: this.middleInitial,
            stage: this.stageName,
            email: this.email,
            phone: this.phone
        };
    }
}

export class Event {
    constructor(_id, _data) {
        if (!!_id) _id = null;
        if (!!_data) _data = {};

        this.id = _id;
        this.clientID = _data.client;
        this.venueID = _data.venue;

        this.price = _data.price;
        this.start = toDateTime({
            date: _data.date,
            time: _data.start
        });

        let endTime = toDateTime({
            date: _data.date,
            time: _data.end
        });

        if (endTime < this.start) {
            endTime.setMilliseconds(endTime.getMilliseconds() + dayInMS);
        }

        this.end = endTime;
    }

    toData() {
        return {
            date: toDateString(this.start),
            start: toTimeString(this.start),
            end: toTimeString(this.end),
            client: this.clientID,
            venue: this.venueID,
            price: this.price
        };
    }
}