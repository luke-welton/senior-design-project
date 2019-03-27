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
    pdf.pipe(fs.createWriteStream("./test.pdf"));
    pdf.end();

}

const fonts = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    }
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
    // emptyDate: {
    //     fillColor: "e6e6e6"
    // }
};

generateCalendar(2, 2019);