Trademark Status App
=====================

A mobile application (IOS, Android compatible) where users can - 
* Search for trademarks 
* Bookmark interesting trademarks and group them into Notebooks
* Receive notifications on status changes to bookmarks
* Indicate preference for specific trademark statuses 
* Share bookmarks with other users

## Components
![HLA](https://s3.amazonaws.com/aeec-public/TSDRMobile-HLA.png)

**USPTO TSDR APIs** - These are existing APIs developed by USPTO that provide APIs for searching Trademarks by serial number, registration number and reference number.

**TSDR Services** – Implements the RESTful services consumed by TSDR Mobile app. Proxies the incoming search request to the TSDR API. Uses MySQL RDS database to store data. Runs a batch job every 5 minutes to check the status of bookmarked applications. If a status change is detected, messages are published to corresponding devices using AWS SNS Service.
See [Installation Details](./services)

**TSDR Mobile App** - The mobile app is built on Ionic, Cordova and uses HTML5, CSS and Javascript. It communicates with TSDR Service for storing and retrieving data. It uses the following plugins to perform native operations – 
* Phonegap Push Plugin
* Cordova Social Sharing Plugin
* Ionic Keyboard Plugin
See [Installation Details](./app)

**MySQL RDS** – Houses the data used by TSDR App. The data elements are – 
* Devices
* Bookmarks
* Notebooks
* PreferredStatusCodes

**AWS SNS** – Is used for sending out push notifications to users when status change is detected. Platform Applications are initially created for iOS and Android Platforms. When individual users install the app, platform endpoints are created in SNS using platform and device specific tokens. AWS SNS Nodejs SDK is used to publish messages.

