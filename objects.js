import Util from "./util";

export class Client {
    constructor(_id, _data) {
        this.id = _id;
        this.firstName = _data.first;
        this.lastName = _data.last;
        this.middleInitial = _data.middle;
        this.stageName = _data.stage || [_data.first, _data.last].join(" ");
        this.email = _data.email;
        this.phone = _data.phone;
    }

    toString() {
        return this.stageName;
    }
}

export class Event {
    constructor(_id, _data) {
        this.id = _id;
        this.clientID = _data.clientID;
        this.price = _data.price;
        this.start = Util.toDateTime({
            date: _data.date,
            time: _data.start
        });

        let endTime = Util.toDateTime({
            date: _data.date,
            time: _data.end
        });

        if (endTime < this.start) {
            endTime.setMilliseconds(endTime.getMilliseconds() + Util.dayInMS);
        }

        this.end = endTime;
    }
}