const {google} = require("googleapis");
const Auth = google.auth;

exports.testConnection = async function main() {
    let client = await Auth.getClient();
    let projectID = await Auth.getProjectId();
    let response = await client.request({
        url: `https://www.googleapis.com/drive/v3/about`
    });

    console.log(response.data);
};