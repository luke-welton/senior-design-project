/*
    This is a Node-ified version of objects.js.
    That one only works with ES6, which Node doesn't natively support
    This one is used for our Cloud Functions
 */

exports.Client = class Client {
    constructor(_data, _id) {
        if (!_id) _id = null;
        if (!_data) _data = {};

        this.id = _id;

        this.performers = _data.performers;
        this.stageName = _data.stage;
        this.email = _data.email;
    }

    toData() {
        return {
            performers: this.performers || [],
            stage: this.stageName || "",
            email: this.email || ""
        };
    }
};