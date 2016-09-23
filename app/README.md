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


The United States Department of Commerce (DOC)and the United States Patent and Trademark Office (USPTO) GitHub project code is provided on an ‘as is’ basis without any warranty of any kind, either expressed, implied or statutory, including but not limited to any warranty that the subject software will conform to specifications, any implied warranties of merchantability, fitness for a particular purpose, or freedom from infringement, or any warranty that the documentation, if provided, will conform to the subject software.  DOC and USPTO disclaim all warranties and liabilities regarding third party software, if present in the original software, and distribute it as is.  The user or recipient assumes responsibility for its use. DOC and USPTO have relinquished control of the information and no longer have responsibility to protect the integrity, confidentiality, or availability of the information. 

User and recipient agree to waive any and all claims against the United States Government, its contractors and subcontractors as well as any prior recipient, if any.  If user or recipient’s use of the subject software results in any liabilities, demands, damages, expenses or losses arising from such use, including any damages from products based on, or resulting from recipient’s use of the subject software, user or recipient shall indemnify and hold harmless the United States government, its contractors and subcontractors as well as any prior recipient, if any, to the extent permitted by law.  User or recipient’s sole remedy for any such matter shall be immediate termination of the agreement.  This agreement shall be subject to United States federal law for all purposes including but not limited to the validity of the readme or license files, the meaning of the provisions and rights and the obligations and remedies of the parties. Any claims against DOC or USPTO stemming from the use of its GitHub project will be governed by all applicable Federal law. “User” or “Recipient” means anyone who acquires or utilizes the subject code, including all contributors. “Contributors” means any entity that makes a modification. 

This agreement or any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not in any manner constitute or imply their endorsement, recommendation or favoring by DOC or the USPTO, nor does it constitute an endorsement by DOC or USPTO or any prior recipient of any results, resulting designs, hardware, software products or any other applications resulting from the use of the subject software.  The Department of Commerce seal and logo, or the seal and logo of a DOC bureau, including USPTO, shall not be used in any manner to imply endorsement of any commercial product or activity by DOC, USPTO  or the United States Government.
