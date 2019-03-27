//import Printer from "pdfmake";
const PDFMake = require("pdfmake");
const fs = require("fs");

const CAL_BLUE = "#2b4574";
const CAL_GREY = "#e6e6e6";

function monthEnum(monthNum) {
    switch (monthNum) {
        case 0: return "January";
        case 1: return "February";
        case 2: return "March";
        case 3: return "April";
        case 4: return "May";
        case 5: return "June";
        case 6: return "July";
        case 7: return "August";
        case 8: return "September";
        case 9: return "October";
        case 10: return "November";
        case 11: return "December";
    }
}

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

        //add new date box to most recent week added
        calendarTable[calendarTable.length - 1].push({
            text: currentDate.getDate()
        });

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

function generateCalendar(month, year, events) {
    let monthStart = new Date(year, month, 1);
    let monthEnd = getMonthEnd(monthStart);

    let content = [];
    content.push({
        text: [monthEnum(month), year].join(" "),
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
    pdf.pipe(fs.createWriteStream("./testCal.pdf"));
    pdf.end();
}

function generateArtistConfirmation(client, event, venue) {
    let content = [];

    [
        "Sinclair's East - Montgomery, AL",
        "Live Performance Contract/Confirmation",
        "Invoice",
        "Music Matters Bookings"
    ].forEach(text => content.push({
        text: text,
        style: "formHeader"
    }));

    content.push({
        text: [
            "\u200B\t\t",
            {text: "Eric Perkins", style: "underlined"},
            " agree(s) to perform live music at Sinclair's East, 7847 Vaughn Rd, Montgomery, AL, 36116 on the evening of ",
            {text: "Saturday, October 27, 2018", style: "underlined"},
            " between the listed hours of ",
            {text: "8:00 PM to 11:00 PM", style: "underlined"},
            ". Sinclair's East in Montgomery, AL agrees to pay the above named artists ",
            {text: "$200.00", style: "underlined"},
            ", and said payment is to be paid upon completion of this performance."
        ],
        style: "formText"
    });

    content.push({
        image: "./assets/icon.png",
        fit: [300, 300],
        style: "logo"
    });

    let printer = new PDFMake(fonts);
    let pdf = printer.createPdfKitDocument({
        content: content,
        styles: pdfStyles,
        defaultStyle: {
            font: "Times"
        }
    });

    pdf.pipe(fs.createWriteStream("./testAC.pdf"));
    pdf.end();
}

function generateInvoice(client, event, venue) {
    let content = [];

    [
        "Sinclair's East - Montgomery, AL",
        "Live Performance Contract/Confirmation",
        "Music Matters Bookings"
    ].forEach(text => content.push({
        text: text,
        style: "formHeader"
    }));

    content.push({
        text: [
            "\u200B\t\t",
            {text: "Eric Perkins", style: "underlined"},
            " agree(s) to perform live music at Sinclair's East, 7847 Vaughn Rd, Montgomery, AL, 36116 on the evening of ",
            {text: "Saturday, October 27, 2018", style: "underlined"},
            " between the listed hours of ",
            {text: "8:00 PM to 11:00 PM", style: "underlined"},
            ". Sinclair's East in Montgomery, AL agrees to pay the above named artists ",
            {text: "$200.00", style: "underlined"},
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

    content.push({
        image: "./assets/icon.png",
        fit: [300, 300],
        style: "logo"
    });

    let printer = new PDFMake(fonts);
    let pdf = printer.createPdfKitDocument({
        content: content,
        styles: pdfStyles,
        defaultStyle: {
            font: "Times"
        }
    });

    pdf.pipe(fs.createWriteStream("./testInvoice.pdf"));
    pdf.end();
}

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
    logo: {
        alignment: "center",
        margin: [0, 50, 0, 0]
    }
};

generateInvoice();

