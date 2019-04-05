const fs = require("fs");
const PDF = require("./pdfHandler");

let eventJSON = "[{\"client\":\"-LZVjvJQEPZkGIHr_A3s\",\"date\":\"2019-04-02\",\"end\":\"2:00\",\"price\":401,\"start\":" +
    "\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LanVmpXmBsY7IZ39GGX\"},{\"client\":\"-LZVjvJQEPZkGIHr_A3s\"," +
    "\"date\":\"2019-05-01\",\"end\":\"2:00\",\"price\":430,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LanVhRBqAiplhy0Ay3i\"}]";

let events = JSON.parse(eventJSON);
pdf = PDF.generateCalendar(5, 2019, events);
pdf.pipe(fs.createWriteStream("functions/pdfs/calendar.pdf"));
