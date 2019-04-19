Hello! This is the repository for Group 1 for COMP 4710: Senior Design Project in the Spring 2019 semester.
We are working on a booking system for Music Matters, located in Montgomery, AL.
If you're looking at this, you are presumably:

* A member of the group
* Our glorious professor, Dr. Kai Chang
* Our glorious sponsor, Mike Moody
* Someone curious about the work of one of the members of the group
* Someone looking to improve the app after we've finished our work

Regardless of who you are, welcome! Here, I'll give some assistance on how you can get everything up and running.

# Requirements
* [Node.js](https://nodejs.org) - We've written this app with cross-compatibility between Android and iOS in mind,
so we are using the React Native framework, which requires Node.js
* [React Native](https://facebook.github.io/react-native/) - A framework written by the supreme overlords over at Facebook to be able to utilize JavaScript when writing for iOS and Android. Based on React, by the same overlords, for web browsers.
* [Expo](https://expo.io) - A toolkit to assist in React Native development, allowing you to write on your computer and super-simply view the product on your phone or relatively-simply on an emulator. It also handles all the compilation into IPA and APK, allowing you to do the former on Windows and the latter without waiting for Android Studio to boot up.
* [Firebase Realtime Database](https://firebase.google.com/docs/database/) - A NoSQL-based cloud database provided by other digital overlords, Google. We chose this one because it's free up to 1GB and works decently well with React Native and Expo.
* [Firebase CLI](https://www.npmjs.com/package/firebase-tools) - A Firebase Command Line Interface that allows you to deploy your microservices to Firebase Cloud Functions, which is where we have our email generation & Drive upload.

# Getting Started
Got everything installed? Good! There's a few more steps to make sure everything's up and running.
1. Clone this repository. I'm sure you know how to do this if you're on GitHub, and if not, guides are a mere Google search away.
2. Navigate to the cloned repository in command line. Again, you know how to do this.
3. Run `npm install`. This will install all the relevant Node modules.
    ```
    {
        apiKey: <your api key here>
    }
    ```
4. Create a file named `auth.json` in the root project folder, and enter the code shown above, alongside the API key.
This will allow you to access the database to be able to retrieve information from it and write to it.
    * ***UNDER NO CIRCUMSTANCES SHOULD YOU EVER ADD THIS FILE TO YOUR REPOSITORY*** (or post it anywhere public).
4. Run `expo start`. This will get everything running to be able to access the app from your phone.
5. Code to your heart's content using your preferred text editor.
7. When you're ready to compile everything into an app, hit Ctrl+C and enter `expo build:ios` or `expo build:android`.
    * For Android, it'll ask if you want to include your own certificate.
If you have one, feel free to use it, or just let Expo do their own thing.
    * For iOS, you'll need to log into an Apple Developer account that is enrolled in the Apple Development Program, which costs $99/year. Sorry man, Apple cares far too much about security (and your money) to get around that cost.

Once Expo's machines finish up everything, you'll get a nice IPA or APK for you to upload to the corresponding app marketplace! 

# Useful Resources
* [React Native Documentation](https://facebook.github.io/react-native/docs/tutorial) - Includes a tutorial on how to write in React, good development tips for each platform, and documentation on what all React Native has to offer.
    * [React Documentation](https://reactjs.org/docs/getting-started.html) - As React Native is a mobile extenstion of React onto mobile apps, it uses a lot of the same elements as the original. Some things are not covered in the above guide, so this can be worth taking a look at as well.
* [React Navigation Documentation](https://reactnavigation.org/en/) - Includes a guide to working with React Navigation, as well as API references. We use this to navigate between the different screens on the app, so I strongly recommend taking a look at it to understand what's going on there!
* [React Native Calendars Repository](https://github.com/wix/react-native-calendars) - This is the framework we used to make our calendar. Thanks, Wix, for making our project a hell of a lot easier. They include some examples and documentation in the readme for their repository.
* [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database/) - Documentation on how to interact with Firebase to access and change information.
    * [Firebase Reference Documentation](https://firebase.google.com/docs/reference/js/) - The above guide is useful for finding out how to do a thing you want correctly, but this is useful for knowing exactly what a function will do.
* [Expo Documentation](https://docs.expo.io/versions/latest/) - All the documentation you need for how to work with Expo. Not quite as necessary as everything else here, as Expo is more limited, but it's still come in handy in a few instances.
* [Firebase CLI Documentation](https://firebase.google.com/docs/cli/) - Documentation on the capabilities of the Firebase CLI.
* [PDFMake Documentation](https://pdfmake.github.io/docs/) - Documentation on PDFMake, which is the package we're using to generate our PDFs.
* [Nodemailer Documentation](https://nodemailer.com/about/) - Nodemailer is the package we're using to send out emails. I highly recommend taking a look at it to understand how to work with it.
* [Drive API Reference](https://developers.google.com/drive/api/v3/about-sdk) - As we're uploading our documents to Mr. Moody's Google Drive, we utilized this API to connect to it.
