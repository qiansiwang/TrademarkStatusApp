Ionic App Base
=====================

A starting project for Ionic that optionally supports using custom SCSS.

## Using this project

We recommend using the [Ionic CLI](https://github.com/driftyco/ionic-cli) to create new Ionic projects that are based on this project but use a ready-made starter template.

For example, to start a new Ionic project with the default tabs interface, make sure the `ionic` utility is installed:

```bash
$ npm install -g ionic
```

Then run:

```bash
$ ionic start myProject tabs
```

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page and the [Ionic CLI](https://github.com/driftyco/ionic-cli) repo.

## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/submit-issue/) to the main Ionic repository.

## Todo
1. Ability to indicate interest in only certain status changes
   * ~~Save preference to device db~~
   * ~~Save preferences to remote db~~
2. Delete Notebooks and Bookmarks
   * ~~ ability to delete notebooks and bookmarks~~
   * 
3. Search Results
   * ~~Show TSDR web page link in search results~~
   * 
4. Sharing
   * ~~the share payload should include - title, status, status date, previous status, previous status date and link to TSDR web page~~
   * also look into the possibility of opening the app from the message and pre-load appropriate view (experimented with it, but more work is needed)
5. Push Notifications
   * ~~Run a scheduler on the server that refreshes status of the bookmarks and sends push notification~~
   *~~ When a push notification is selected, it should open a new view which shows all trademarks that have undergone status changes~~
   * ~~The badge count should be set to the number of status changes and updated~~
   * configure and test push notifications for Android
   *~~ Show badge count on Notebooks tab~~
   * ~~Show badge count on App icon~~
   * Notifications should only be sent for preferred status code changes
   * Test sound and vibrate
6. Use TestFlight for beta testing
7. Test on Android Phone
