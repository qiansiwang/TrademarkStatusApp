Trademark Status Mobile App
=====================

The mobile app is built using Ionic framework and depends on [TSDR services](./../services).


## Installation

* Clone this Git repo
* Navigate to the app folder
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
* The app uses Node.js services running on AWS. If you build and deploy your own set of services, you could point the app to use your services by modifying the url in 'app.js'. 
```
 $rootScope.serverBaseUrl = "<url to services>";
```
## Running pre-built releases
* Download [Android APK](.releases/android-release-unsigned.apk) and follow [http://www.greenbot.com/article/2452614/how-to-sideload-an-app-onto-your-android-phone-or-tablet.html](http://www.greenbot.com/article/2452614/how-to-sideload-an-app-onto-your-android-phone-or-tablet.html)
* Download [iOS IPA](.releases/TSDRMobile.ipa) and follow [http://stackoverflow.com/a/26904969](http://stackoverflow.com/a/26904969)


The United States Department of Commerce (DOC) GitHub project code is provided on an ‘as is’ basis and the user assumes responsibility for its use. DOC has relinquished control of the information and no longer has responsibility to protect the integrity, confidentiality, or availability of the information. Any claims against the Department of Commerce stemming from the use of its GitHub project will be governed by all applicable Federal law. Any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recommendation or favoring by the Department of Commerce. The Department of Commerce seal and logo, or the seal and logo of a DOC bureau, shall not be used in any manner to imply endorsement of any commercial product or activity by DOC or the United States Government.
