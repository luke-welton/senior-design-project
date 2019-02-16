import {toTimeString, toDateString, toDateTime, dayInMS} from "./util";

class Performer {
    constructor(_data) {
        this.firstName = _data.first;
        this.lastName = _data.last;
        this.middleInitial = _data.middle;
    }

    toData() {
        return {
            first: this.firstName || "",
            last: this.lastName || "",
            middle: this.middleInitial || ""
        };
    };
}

export class Client {
    constructor(_data, _id) {
        if (!_id) _id = null;
        if (!_data) _data = {};

        this.id = _id;

        this.performers = [];
        _data.performers.forEach(data => {
            this.performers.push(new Performer(data))
        });

        this.stageName = _data.stage;
        this.email = _data.email;
    }

    toData() {
        let performers = [];
        this.performers.forEach(performer => {
            performers.push(performer.toData());
        });

        return {
            performers: performers,
            stage: this.stageName || "",
            email: this.email || ""
        };
    }
}

export class Event {
    constructor(_data, _id) {
        if (!_id) _id = null;
        if (!_data) _data = {
            price: 0.00,
            date: toDateString(new Date())
        };

        this.id = _id;
        this.clientID = _data.client;
        this.venueID = _data.venue;
        this.price = parseFloat(_data.price || 0);

        this.start = toDateTime({
            date: _data.date,
            time: _data.start
        });

        let endTime = toDateTime({
            date: _data.date,
            time: _data.end
        });

        if (endTime < this.start) {
            endTime.setMilliseconds(endTime.getTime() + dayInMS);
        }

        this.end = endTime;
    }

    update(data) {
        if (!data) return;

        this.clientID = data.clientID || this.clientID;
        this.venueID = data.venueID || this.venueID;
        this.price = data.price || this.price;

        if (data.start) this.start = data.start;
        if (data.end) this.end = data.end;

        if (data.date) {
            let splits = data.date.split("-");
            this.start.setFullYear(splits[0], splits[1] -1, splits[2]);
            this.end.setFullYear(splits[0], splits[1] - 1, splits[2]);
        }
        if (data.startTime) {
            let splits = data.startTime.split(":");
            this.start.setMinutes(splits[0], splits[1]);
        }
        if (data.endTime) {
            let splits = data.endTime.split(":");
            this.end.setMinutes(splits[0], splits[1]);
        }

        if (this.end < this.start) {
            this.end.setMilliseconds(this.end.getTime() + dayInMS);
        }
    }


    toData() {
        return {
            date: toDateString(this.start),
            start: toTimeString(this.start),
            end: toTimeString(this.end),
            client: this.clientID || "",
            venue: this.venueID || "",
            price: this.price || 0
        };
    }
}

export class Venue {
    constructor(_id, _name) {
        this.id = _id.toString();
        this.name = _name;
    }
}