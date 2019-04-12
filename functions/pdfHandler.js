const PDFMake = require("pdfmake");
const Util = require("./util.js");

const CAL_BLUE = "#2b4574";
const CAL_GREY = "#e6e6e6";

function generateCalendarTable(startDate, events) {
    let calendarTable = [];

    let daysHeader = [];
    ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].forEach(day => {
         daysHeader.push({
             text: day,
             style: "calHeader"
         });
    });

    calendarTable.push(daysHeader);

    //populate with empty boxes before 1st
    if (startDate.getDay() > 0) {
        calendarTable.push([]);
        for (let i = 0; i < startDate.getDay(); i++) {
            calendarTable[1].push({
                text: "",
                style: "emptyDate"
            })
        }
    }

    let currentDate = startDate;
    while (currentDate.getMonth() === startDate.getMonth()) {
        //if at the end of the week, add another array
        if (currentDate.getDay() === 0) {
            calendarTable.push([]);
        }

        let cellArray = [];
        cellArray.push({
            text: currentDate.getDate()
        });

        let matchingEvents = events.filter(event => {
            let eventDate = new Date(Util.toUS(event.date));
            return eventDate.getTime() === currentDate.getTime();
        });

        matchingEvents.forEach((event, i) => {
            if (i < 2) {
                cellArray.push({
                    text: [Util.toAMPM(event.start), Util.toAMPM(event.end)].join("-"),
                    style: "dateTimeslot"
                });
                cellArray.push({
                    text: event.client.stage,
                    style: "dateClient"
                });
            }
        });

        //add new date box to most recent week added
        calendarTable[calendarTable.length - 1].push(cellArray);

        //go to next day
        currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    //populate with empty boxes after end of month
    for (let i = currentDate.getDay(); i < 7; i++) {
        calendarTable[calendarTable.length - 1].push({
            text: "",
            style: "emptyDate"
        });
    }

    return calendarTable;
}

function getMonthEnd(monthStart) {
    let monthEnd = new Date(monthStart.getTime());
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    if (monthEnd < monthStart) {
        monthEnd.setFullYear(monthEnd.getFullYear());
    }

    monthEnd.setTime(monthEnd.getTime() - 24 * 60 *60 * 1000);

    return monthEnd;
}

exports.generateCalendar = function (month, year, events) {
    //months begin at 0, not 1
    month -= 1;

    let monthStart = new Date(year, month, 1);
    let monthEnd = getMonthEnd(monthStart);

    let content = [];
    content.push({
        text: [Util.monthEnum(month), year].join(" "),
        style: "calMonth"
    });
    content.push({
        table: {
            headerRows: 1,
            body: generateCalendarTable(monthStart, events),
            widths: ["*", "*", "*", "*", "*", "*", "*"],
            heights: (row) => {
                if (row === 0) return "*";
                else return 70;
            }
        },
        layout: {
            fillColor: (row, node, column) => {
                if (row === 0) return CAL_BLUE;
                else if (row === 1 && column < monthStart.getDay()) return CAL_GREY;
                else if (row === node.table.body.length - 1 && column > monthEnd.getDay()) return CAL_GREY;
                else if (column === 0 || column === 6) return "#dee2f2";
                else return null;
            }
        }
    });

    let printer = new PDFMake(fonts);
    let pdf = printer.createPdfKitDocument({
        pageOrientation: "landscape",
        content: content,
        styles: pdfStyles,
        defaultStyle: {
            font: "Helvetica"
        }
    });
    pdf.end();

    return pdf;
};

let stringifyNames = function (performerNames) {
    if (performerNames.length === 1) {
        return performerNames[0];
    } else if (performerNames.length === 2) {
        return performerNames.join(" and ");
    } else {
        let returnString = "";

        for (let i = 0; i < performerNames.length - 1; i++) {
            returnString += performerNames[i] + ", ";
        }

        returnString += " and " + performerNames[performerNames.length - 1];
        return returnString;
    }
};

exports.generateInvoice = function (client, event, venue) {
    let content = [];

    [
        venue.name + " - " + venue.address.city + ", " + venue.address.state,
        "Live Performance Contract/Confirmation",
        "Invoice",
        "Music Matters Bookings"
    ].forEach(text => content.push({
        text: text,
        style: "formHeader"
    }));

    let eventDate = new Date(Util.toUS(event.date));

    content.push({
        text: [
            "\u200B\t\t",
            {text: stringifyNames(client.performers), style: "underlined"},
            " agree(s) to perform live music at " + venue.name + ", " +
                venue.address.street1 + venue.address.street2 + ", " +
                venue.address.city + ", " + venue.address.state + ", " + venue.address.zip + " on the evening of ",
            {
                text: Util.dayEnum(eventDate.getDay()) + ", " +
                        Util.monthEnum(eventDate.getMonth()) + " " +
                        eventDate.getDate() + ", " + eventDate.getFullYear(),
                style: "underlined"
            },
            " between the listed hours of ",
            {text: Util.toAMPM(event.start) + " to " + Util.toAMPM(event.end), style: "underlined"},
            ". " + venue.name + " in " + venue.address.city + ", " + venue.address.state + " agrees to pay the above named artists ",
            {text: "$" + parseFloat(event.price).toFixed(2), style: "underlined"},
            ", and said payment is to be paid upon completion of this performance."
        ],
        style: "formText"
    });
    //
    // content.push({
    //     image: "../assets/icon.png",
    //     fit: [300, 300],
    //     style: "logo"
    // });

    let printer = new PDFMake(fonts);
    let pdf = printer.createPdfKitDocument({
        content: content,
        styles: pdfStyles,
        defaultStyle: {
            font: "Times"
        }
    });
    pdf.end();

    return pdf;
};

exports.generateArtistConfirmation = function (client, event, venue) {
    let content = [];

    [
        venue.name + " - " + venue.address.city + ", " + venue.address.state,
        "Live Performance Contract/Confirmation",
        "Music Matters Bookings"
    ].forEach(text => content.push({
        text: text,
        style: "formHeader"
    }));

    let eventDate = new Date(Util.toUS(event.date));

    content.push({
        text: [
            "\u200B\t\t",
            {text: stringifyNames(client.performers), style: "underlined"},
            " agree(s) to perform live music at " + venue.name + ", " +
            venue.address.street1 + venue.address.street2 + ", " +
            venue.address.city + ", " + venue.address.state + ", " + venue.address.zip + " on the evening of ",
            {
                text: Util.dayEnum(eventDate.getDay()) + ", " +
                    Util.monthEnum(eventDate.getMonth()) + " " +
                    eventDate.getDate() + ", " + eventDate.getFullYear(),
                style: "underlined"
            },
            " between the listed hours of ",
            {text: Util.toAMPM(event.start) + " to " + Util.toAMPM(event.end), style: "underlined"},
            ". " + venue.name + " in " + venue.address.city + ", " + venue.address.state + " agrees to pay the above named artists ",
            {text: "$" + parseFloat(event.price).toFixed(2), style: "underlined"},
            ", and said payment is to be paid upon completion of this performance."
        ],
        style: "formText"
    });

    content.push({
        text: [
            "\u200B\t\t",
            {text: "$40", style: "underlined"},
            " booking fee due to ",
            {text: "Music Matters Bookings", style: "underlined"},
            " on the evening of this performance."
        ],
        style: "formText"
    });


    content.push({
        text: [
            "\u200B\t\t",
            "If for reasons beyond your control you are unable to make your scheduled confirmed performance date and time, ",
            "it is our expectation that you will contact Mike Moody at ",
            {text: "619-307-5866", style: "underlined"},
            ". This should be done at the earliest possible time, but no later than four hours prior to your set. ",
            "Thank you in advance for complying with this request."
        ],
        style: "formText"
    });
    //
    // content.push({
    //     image: "../assets/icon.png",
    //     fit: [300, 300],
    //     style: "logo"
    // });

    let printer = new PDFMake(fonts);
    let pdf = printer.createPdfKitDocument({
        content: content,
        styles: pdfStyles,
        defaultStyle: {
            font: "Times"
        }
    });
    pdf.end();

    return pdf;
};

exports.generateBookingList = function (month, year, events, venue) {
    let names = [];
    let times = [];
    let comp = []
    let content = [];


    [
        venue.name + " Music Bookings " ,
        "by Date",
        month + " " + year
    ].forEach(text => content.push({
        text: text,
        style: "formHeader"
    }));

    let matchingEvents = events.filter(event => {
        let eventDate = new Date(Util.toUS(event.date));
        return eventDate.getTime() === currentDate.getTime();
    });

    // get each name, gig time, and compensation
    matchingEvents.forEach((event, i) => {
        if (i < 2) {
            names.push(event.client.stageName)
            times.push([Util.toAMPM(event.start), Util.toAMPM(event.end)].join(" to "))
            comp.push(event.price)
        }
    });

    content.push({
        style: 'tableExample',
        table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*", "*", "*", "*"],
            body: [
                [{text: 'Artist', style: 'columnHeader'}, {text: 'Gig Time', style: 'tableHeader'}, {text: 'Compensation', style: 'columnHeader'}],
                ['1- ' + names[0], times[0], comp[0]],
                ['1- ' + names[1], times[1], comp[1]],
                ['2- ' + names[2], times[2], comp[2]],
                ['2- ' + names[3], times[3], comp[3]],
                ['3- ' + names[4], times[4], comp[4]],
                ['3- ' + names[5], times[5], comp[5]],
                ['4- ' + names[6], times[6], comp[6]],
                ['4- ' + names[7], times[7], comp[7]],
                ['5- ' + names[8], times[8], comp[8]],
                ['5- ' + names[9], times[9], comp[9]],
                ['6- ' + names[10], times[10], comp[10]],
                ['6- ' + names[11], times[11], comp[11]],
                ['7- ' + names[12], times[12], comp[12]],
                ['7- ' + names[12], times[12], comp[12]],
                ['8- ' + names[13], times[13], comp[13]],
                ['8- ' + names[14], times[14], comp[14]],
                ['9- ' + names[15], times[15], comp[15]],
                ['9- ' + names[16], times[16], comp[16]],
                ['10- ' + names[17], times[17], comp[17]],
                ['10- ' + names[18], times[18], comp[18]],
                ['11- ' + names[19], times[19], comp[19]],
                ['11- ' + names[20], times[20], comp[20]],
                ['12- ' + names[21], times[21], comp[21]],
                ['12- ' + names[21], times[21], comp[21]],
                ['13- ' + names[22], times[22], comp[22]],
                ['13- ' + names[23], times[23], comp[23]],
                ['14- ' + names[24], times[24], comp[24]],
                ['14- ' + names[25], times[25], comp[25]],
                ['15- ' + names[26], times[26], comp[26]],
                ['15- ' + names[27], times[27], comp[27]],
                ['16- ' + names[28], times[28], comp[28]],
                ['16- ' + names[29], times[29], comp[29]],
                ['17- ' + names[30], times[30], comp[30]],
                ['17- ' + names[31], times[31], comp[31]],
                ['18- ' + names[32], times[32], comp[32]],
                ['18- ' + names[33], times[33], comp[33]],
                ['19- ' + names[34], times[34], comp[34]],
                ['19- ' + names[35], times[35], comp[35]],
                ['20- ' + names[36], times[36], comp[36]],
                ['20- ' + names[37], times[37], comp[37]],
                ['21- ' + names[38], times[38], comp[38]],
                ['21- ' + names[39], times[39], comp[39]],
                ['22- ' + names[40], times[40], comp[40]],
                ['22- ' + names[41], times[41], comp[41]],
                ['23- ' + names[42], times[42], comp[42]],
                ['23- ' + names[43], times[43], comp[43]],
                ['24- ' + names[44], times[44], comp[44]],
                ['24- ' + names[45], times[45], comp[45]],
                ['25- ' + names[46], times[46], comp[46]],
                ['25- ' + names[47], times[47], comp[47]],
                ['26- ' + names[48], times[48], comp[48]],
                ['26- ' + names[49], times[49], comp[49]],
                ['27- ' + names[50], times[50], comp[50]],
                ['27- ' + names[51], times[51], comp[51]],
                ['28- ' + names[52], times[52], comp[52]],
                ['28- ' + names[53], times[53], comp[53]],
                ['29- ' + names[54], times[54], comp[54]],
                ['29- ' + names[55], times[55], comp[55]],
                ['30- ' + names[56], times[56], comp[56]],
                ['30- ' + names[57], times[57], comp[57]],
                ['31- ' + names[58], times[58], comp[58]],
                ['31- ' + names[59], times[59], comp[59]],
            ]
        },
        layout: 'noBorders'
    });

    //
    // content.push({
    //     image: "../assets/icon.png",
    //     fit: [300, 300],
    //     style: "logo"
    // });

    let printer = new PDFMake(fonts);
    let pdf = printer.createPdfKitDocument({
        content: content,
        styles: pdfStyles,
        defaultStyle: {
            font: "Times"
        }
    });
    pdf.end();

    return pdf;
};

const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    },
    Times: {
        normal: 'Times-Roman',
        bold: 'Times-Bold',
        italics: 'Times-Italic',
        bolditalics: 'Times-BoldItalic'
    },
};

const pdfStyles = {
    calMonth: {
        fontSize: 50,
        bold: true,
        color: CAL_BLUE,
        alignment: "center",
        margin: [0, 0, 0, 5]

    },
    calHeader: {
        color: "#fff",
        bold: true,
        alignment: "center"
    },
    underlined: {
        decoration: "underline"
    },
    formHeader: {
        fontSize: 25,
        alignment: "center",
        margin: [0, 0, 0, 25]
    },
    formText: {
        fontSize: 15,
        lineHeight: 1.25,
        margin: [0, 0, 0, 15]
    },
    dateTimeslot: {
        fontSize: 11,
        bold: true,
        margin: [0, 10, 0, 0]
    },
    columnHeader: {
        fontSize: 22,
        bold: true,
        alignment: "center"
    }
};

