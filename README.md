Trademark Status App
=====================

A mobile application (IOS, Android compatible) where users can - 
* Search for trademarks 
* Bookmark interesting trademarks and group them into Notebooks
* Receive notifications on status changes to bookmarks
* Indicate preference for specific trademark statuses 
* Share bookmarks

## Components
![HLA](https://s3.amazonaws.com/aeec-public/TSDRMobile-HLA.png)

**USPTO TSDR APIs** - These are existing APIs developed by USPTO that provide APIs for searching Trademarks by serial number, registration number and reference number.

**TSDR Services** – Implements the RESTful services consumed by TSDR Mobile app. Proxies the incoming search request to the TSDR API. Uses MySQL RDS database to store data. Runs a batch job every 5 minutes to check the status of bookmarked applications. If a status change is detected, messages are published to corresponding devices using AWS SNS Service.
See [Installation Details](./services).

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

The United States Department of Commerce (DOC) GitHub project code is provided on an ‘as is’ basis and the user assumes responsibility for its use. DOC has relinquished control of the information and no longer has responsibility to protect the integrity, confidentiality, or availability of the information. Any claims against the Department of Commerce stemming from the use of its GitHub project will be governed by all applicable Federal law. Any reference to specific commercial products, processes, or services by service mark, trademark, manufacturer, or otherwise, does not constitute or imply their endorsement, recommendation or favoring by the Department of Commerce. The Department of Commerce seal and logo, or the seal and logo of a DOC bureau, shall not be used in any manner to imply endorsement of any commercial product or activity by DOC or the United States Government.

<br />
<br />
<p xmlns:dct="http://purl.org/dc/terms/" xmlns:vcard="http://www.w3.org/2001/vcard-rdf/3.0#">
  <a rel="license"
     href="http://creativecommons.org/publicdomain/zero/1.0/">
    <img src="http://i.creativecommons.org/p/zero/1.0/88x31.png" style="border-style: none;" alt="CC0" />
  </a>
  <br />
  To the extent possible under law,
  <a rel="dct:publisher"
     href="https://github.com/USPTO/TrademarkStatusApp">https://github.com/USPTO/TrademarkStatusApp</a>
  has waived all copyright and related or neighboring rights to
  <span property="dct:title">Trademark Status Mobile Application</span>.
This work is published from:
<span property="vcard:Country" datatype="dct:ISO3166"
      content="US" about="https://github.com/USPTO/TrademarkStatusApp">
  United States</span>.
</p>
