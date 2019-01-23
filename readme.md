Hello! This is the repository for Group 1 for COMP 4710: Senior Design Project in the Spring 2019 semester.
We are working on a booking system for Music Matters, located in Montgomery, AL.
If you're looking at this, you are presumably:

1. A member of the group
2. Our glorious professor, Dr. Kai Chang
3. Our glorious sponsor, ((add his name later i forgot it lmao))
4. Someone curious about the work of one of the members of the group
5. Someone looking to improve the app after we've finished our work

Regardless of who you are, welcome! Here, I'll give some assistance on how you can get everything up and running.

# Requirements
* [Node.js](https://nodejs.org) - We've written this app with cross-compatibility between Android and iOS in mind,
so we are using the React Native framework, which requires Node.js
* [React Native](https://facebook.github.io/react-native/) - A framework written by the supreme overlords over at Facebook
to be able to utilize JavaScript when writing for iOS and Android. Based on React, by the same overlords, for web browsers.
* [Expo](https://expo.io) - A toolkit to assist in React Native development, allowing you to write on your computer and
super-simply view the product on your phone. It also handles all the compilation into IPA and APK, allowing you to do the
former on Windows and the latter without waiting for Android Studio to boot up.
* [Firebase Realtime Database](https://firebase.google.com/docs/database/) - 
A NoSQL-based cloud database provided by other digital overlords, Google. We chose this one because it's free up to 1GB 
and works decently well with React Native and Expo.
* Our API Key for Firebase - Don't have it? You probably shouldn't then. This should be in the hands of our sponsor or Dr. Chang,
so contact one of them if you're desperate to help the app development.
Alternatively, you can use this with your own database's API key, change around a few things, and it should work fine.

# Getting Started
Got everything installed? Good! There's a few more steps to make sure everything's up and running.
1. Clone this repository. I'm sure you know how to do this if you're on GitHub,
and if not, guides are a mere Google search away.
2. Navigate to the cloned repository in command line.
Again, you know how to do this.
3. Run `npm install`. This will install all the relevant Node modules,
namely Expo, React, React Native, Firebase, and all of their dependencies.
    ```
    {
        apiKey: <your api key here>
    }
    ```
4. Create a file named `auth.json` in the root project folder, and enter the code shown above.
This will allow you to access the database to be able to retrieve information from it and write to it.
***UNDER NO CIRCUMSTANCES SHOULD YOU EVER ADD THIS FILE TO YOUR REPOSITORY*** (or post it anywhere public).
This will compromise the security of the database, and if you're a group member, congrats,
you just wrecked the entire project for everyone.
4. Run `expo start`. This will get everything running to be able to access the app from your phone.
5. Code to your heart's content using your preferred text editor.
7. When you're ready to compile everything into an app, hit Ctrl+C and enter `expo build:ios` or `expo build:android`.
8. It'll ask if you want to include your own certificate.
If you have one, feel free to use it, or just let Expo do their own thing.

Once Expo's machines finish up everything, you'll get a nice IPA or APK for you to upload to the corresponding app marketplace! 

# Useful Resources
* [React Native Documentation](https://facebook.github.io/react-native/docs/tutorial) -
Includes a tutorial on how to write in React, good development tips for each platform, and documentation on what all React Native has to offer.
* [Firebase Realtime Database Documentation](https://firebase.google.com/docs/database/) -
Documentation on how to interact with Firebase to access and change information.

* [Expo Documentation](https://docs.expo.io/versions/latest/) -
All the documentation you need for how to work with Expo. Not quite as necessary as the other two, as Expo is more limited,
but it's still come in handy in a few instances.
