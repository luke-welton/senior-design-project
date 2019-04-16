const PDFMake = require("pdfmake");
const Util = require("../util.js");

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
    let eventAddress = venue.address.street1;
    if (venue.address.street2) {
        eventAddress += " " + venue.address.street2;
    }

    content.push({
        text: [
            "\u200B\t\t",
            {text: stringifyNames(client.performers), style: "underlined"},
            " agree(s) to perform live music at " + venue.name + ", " +
                eventAddress + ", " +
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
    let eventAddress = venue.address.street1;
    if (venue.address.street2) {
        eventAddress += " " + venue.address.street2;
    }

    content.push({
        text: [
            "\u200B\t\t",
            {text: stringifyNames(client.performers), style: "underlined"},
            " agree(s) to perform live music at " + venue.name + ", " +
            eventAddress + ", " +
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
    //months begin at 0, not 1
    month -= 1;

    let content = [];

    [
        venue.name + " Music Bookings by Date",
        Util.monthEnum(month) + " " + year
    ].forEach(text => content.push({
        text: text,
        style: "formHeader"
    }));

    let bookingListTable = [];
    bookingListTable.push(["Artist", "Gig Time", "Compensation"].map(headerName => {
        return {
            text: headerName,
            style: "columnHeader"
        };
    }));

    let firstDate = new Date(year, month, 1);
    let currentDate = new Date(firstDate.getTime());

    while (currentDate.getMonth() === firstDate.getMonth()) {
        let matchingEvents = events.filter(event => {
            let eventDate = new Date(Util.toUS(event.date));
            return eventDate.getTime() === currentDate.getTime();
        });

        // get each name, gig time, and compensation
        matchingEvents.forEach((event, i) => {
            if (i < 2) {
                let name = [currentDate.getDate(), event.client.stage].join(" - ");
                let time = [Util.toAMPM(event.start), Util.toAMPM(event.end)].join(" to ");
                let price = "$" + parseFloat(event.price).toFixed(2);

                bookingListTable.push([name,
                    {
                        text: time,
                        style: "centerText"
                    },
                    {
                        text: price,
                        style: "centerText"
                    }
                ]);
            }
        });

        currentDate.setTime(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    content.push({
        style: 'tableExample',
        table: {
            headerRows: 1,
            widths: ["*", "*", "*"],
            body: bookingListTable
        },
        layout: 'noBorders'
    });

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
    dateClient: {
        fontSize: 10
    },
    columnHeader: {
        fontSize: 22,
        bold: true,
        alignment: "center"
    },
    centerText: {
        alignment: "center"
    }
};

