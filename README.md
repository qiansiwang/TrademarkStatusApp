Trademark Status App
=====================

A mobile application (IOS, Android compatible) that alerts users of trademark status changes. 

## Installation

* Clone this Git repo
* Install Node.js
* Install Cordova and Ionic
```
$ npm install -g cordova ionic
```
* Add the desired platform
```
$ ionic platform add ios
$ ionic platform add android
```
* Build and run the app
```
(Note - To build and run on an iOS device Xcode is required. To build and run on an Android device Android SDK is required.)
$ ionic build ios
$ ionic emulate ios
$ ionic build android
$ ionic emulate android
```

## Running pre-built releases
* Download [Android APK](.releases/android-release-unsigned.apk) and follow [http://www.greenbot.com/article/2452614/how-to-sideload-an-app-onto-your-android-phone-or-tablet.html](http://www.greenbot.com/article/2452614/how-to-sideload-an-app-onto-your-android-phone-or-tablet.html)
* Download [iOS IPA](.releases/TSDRMobile.ipa) and follow [http://stackoverflow.com/a/26904969](http://stackoverflow.com/a/26904969)
