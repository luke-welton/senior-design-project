const puppeteer = require('puppeteer');
const fs = require('fs-extra');


(async function() {
    try {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent('<p style="text-align: center;"><strong>RENAISSANCE/EXCHANGE MONTGOMERY, AL </strong></p>\n' +
            '<p style="text-align: center;"><strong>LIVE PERFORMANCE CONTRACT/CONFIRMATION </strong></p>\n' +
            '<p style="text-align: center;"><strong>INVOICE </strong></p>\n' +
            '<p style="text-align: center;"><strong>MUSICMATTERSBOOKINGS.COM </strong></p>\n' +
            '<p><strong>________________ artist/performers agree to perform live music at The Renaissance /Exchange Bar, 201 Tallapoosa St., Montgomery, AL 36104 on the evening of _________ between the listed hours of __________and The Renaissance /Exchange Bar in Montgomery, AL. agrees to pay the above named artists $ ______ and said payment to be paid upon completion of this performance. </strong></p>');
        await page.emulateMedia('screen');
        await page.pdf({
            path: 'invoice.pdf',
            format: 'A4',
            printBackground: true
        });

        console.log('done');
        await browser.close();
        process.exit()

    } catch (e) {
        console.log('our error', e);
    }
})();