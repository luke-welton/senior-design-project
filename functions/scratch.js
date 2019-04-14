const fs = require("fs");
const PDF = require("./pdfHandler");

let eventJSON = "[{\"client\":{\"email\":\"jzb0123@auburn.edu\",\"performers\":[\"Jean-Luc Beaudette\"],\"stage\":\"Jean" + "" +
    "-Luc Beaudette\"},\"date\":\"2019-04-02\",\"end\":\"2:00\",\"month\":\"2019-04\",\"price\":401,\"start\":\"0:30\",\"venue\"" +
    ":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LanVmpXmBsY7IZ39GGX\"},{\"client\":{\"email\":\"jzb0123@auburn.edu\",\"performers\":" +
    "[\"Jean-Luc Beaudette\"],\"stage\":\"Jean-Luc Beaudette\"},\"date\":\"2019-04-07\",\"end\":\"2:00\",\"month\":\"2019-04\"," +
    "\"price\":0,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LbqlkDo6HZcbE0FjCGh\"},{\"client\":{" +
    "\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-08\"," +
    "\"end\":\"2:00\",\"month\":\"2019-04\",\"price\":0,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-" +
    "LbxbswMFu9n-8zvrul7\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke " +
    "Welton\"},\"date\":\"2019-04-08\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":" +
    "\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcEUykBpcLaVhF8Lku_\"},{\"client\":{\"email\":\"jzb0123@auburn.edu\",\"performers\"" +
    ":[\"Jean-Luc Beaudette\"],\"stage\":\"Jean-Luc Beaudette\"},\"date\":\"2019-04-10\",\"end\":\"2:00\",\"month\":\"2019-04" +
    "\",\"price\":7,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LbqjWhmqG_ovQLbdVbY\"},{\"client\":{\"email\"" +
    ":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\"," +
    "\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcDvrWn7YtcLI7z_MPC\"}," +
    "{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\"," +
    "\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcDvshOwwxrUnjFHOCf\"}" +
    ",{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":" +
    "\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\"," +
    "\"id\":\"-LcDvuBiFMMcsHyHvp_7\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":" +
    "\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"" +
    "-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcDxThR0-yCeup6A8dp\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"]" +
    ",\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\"," +
    "\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcDxVlkLvUvaFLve7dB\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":" +
    "[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0," +
    "\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcDy5LWvOMizaUnhclR\"},{\"client\":{\"email\":\"law0047@auburn.edu\"" +
    ",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":" +
    "0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcDyIfhvShmBCwxeZAv\"},{\"client\":{\"email\":\"law0047@auburn.edu\"," +
    "\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0," +
    "\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcETC3f_Vy9S2Ryn245\"},{\"client\":{\"email\":\"law0047@auburn.edu\"," +
    "\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":" +
    "0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcETGD9xE8y-IGWsOaF\"},{\"client\":{\"email\":\"law0047@auburn.edu\"," +
    "\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0," +
    "\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcETKvUoAcWOIjczEZo\"},{\"client\":{\"email\":\"law0047@auburn.edu\"," +
    "\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0," +
    "\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcETMlW_6GBrxm9pl0t\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"" +
    "performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04" +
    "\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcETPxQ0-88gv8xxxaE\"},{\"client\":" +
    "{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10" +
    "\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\"" +
    ":\"-LcETjE8bEn6-DInNbAO\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\"" +
    ":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"" +
    "venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcEWCpBilwvL4G9kbbp\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"" +
    "performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"" +
    "2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcEXb6yE-8oJTHNObXD\"},{\"" +
    "client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\"" +
    ":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcEfb1zhtsP5Zmlnvjp\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-10\",\"end\":\"0:30\",\"month\":\"2019-04\",\"price\":0,\"start\":\"22:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcEg-Vv2r9c8xecVEwu\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-11\",\"end\":\"4:00\",\"month\":\"2019-04\",\"price\":0,\"start\":\"1:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcEVAjDml2ktRukG9ag\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-11\",\"end\":\"4:00\",\"month\":\"2019-04\",\"price\":0,\"start\":\"1:00\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LcEXV_Vy87-_5qrtWOp\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-20\",\"end\":\"2:00\",\"month\":\"2019-04\",\"price\":0,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LbrB642wj-gWmCsUCSb\"},{\"client\":{\"email\":\"jzb0123@auburn.edu\",\"performers\":[\"Jean-Luc Beaudette\"],\"stage\":\"Jean-Luc Beaudette\"},\"date\":\"2019-04-23\",\"end\":\"2:00\",\"month\":\"2019-04\",\"price\":0,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-Lbqm9WETJDPQxavuc6w\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-27\",\"end\":\"2:00\",\"month\":\"2019-04\",\"price\":0,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-Lbr9QpfxJB-bO2reQc8\"},{\"client\":{\"email\":\"law0047@auburn.edu\",\"performers\":[\"Lucas Welton\"],\"stage\":\"Luke Welton\"},\"date\":\"2019-04-30\",\"end\":\"2:00\",\"month\":\"2019-04\",\"price\":0,\"start\":\"0:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-Lbr8mS871lTbtInuhFN\"},{\"client\":{\"email\":\"jzb0123@auburn.edu\",\"performers\":[\"Jean-Luc Beaudette\"],\"stage\":\"Jean-Luc Beaudette\"},\"date\":\"2019-05-01\",\"end\":\"4:00\",\"month\":\"2019-04\",\"price\":501,\"start\":\"2:30\",\"venue\":\"-L_JL7YiIf2-Gu_t3lWz\",\"id\":\"-LanVOxPy1ecJCjSluMn\"}]";

let events = JSON.parse(eventJSON);
pdf = PDF.generateBookingList(4, 2019, events, {
    name: "Test Name"
});
pdf.pipe(fs.createWriteStream("functions/pdfs/bookingList.pdf"));

// const Util = require("./util");
// let promises = [];
// for (let i = 0; i < 100; i++) {
//     promises.push(() => {
//         //if (i < 99) {
//             return Promise.resolve(i);
//         // } else {
//         //     return Promise.reject("NO");
//         // }
//     });
// }
//
// Util.staggerPromises(promises, 100, 10).then(() => {
//     console.log("done!");
// }).catch(err => console.log(err));