angular.module('main').service("TrademarkService", function($window, $http, $q, $cordovaSQLite, $rootScope, TrademarkInfo, Notebook, Bookmark, AppConfig, $cordovaBadge, $cordovaSocialSharing, $cordovaAppVersion){

  this.searchTrademarks = function(searchString, callback){

    var markIds = parseSearchText(searchString);
    if(!markIds){
      return $q(function(resolve, reject){
        reject({data: {status: 400}});
      })
    }
    var _this = this;
    var promises = [];
    angular.forEach(markIds, function(markId, index){
      var promise = _this.searchTrademark(markId);
      promises.push(promise);
    });

    return $q(function(resolve, reject){
      $q.all(promises).then(function(results){
        if(results instanceof Array){
          resolve({data: results});
        }else{
          resolve({data: [results]});
        }
      }, function(response){
        var status = response.status;
        reject({data: {message:"Error in search", status: status}});
      })
    });

  }

  this.registerDeviceWithServer = function(){
    var url = buildUrl("/tsdrService/devices");
    var deviceRemote = {
      app_id: getRandomString(),
      push_enabled: 0,
      device_type: device.platform,
      device_os: device.version
    }
    return $http({
      method:"POST",
      url: url,
      data: deviceRemote
    }).then(function(response){
      var deviceId = response.data.device_id;
      return {data: deviceId};
    }, function(err){
      console.log("Error registering device with server - "+JSON.stringify(err));
      return err;
    });
  }

  this.logSession = function(){
    var url = buildUrl("/tsdrService/devices/:deviceId/sessions", []);
    return $q(function(resolve, reject){
      $cordovaAppVersion.getVersionNumber().then(function(version){
        var deviceSession = {
          app_version : version
        }
        // get ip address
        $http.get("https://api.ipify.org?format=json").then(function(response){
          deviceSession.ip_address = response.data.ip;
          $http.post(url, deviceSession).then(function(response){
            resolve({data: response.data.session_id});
          });
        }, function(){
          // continue to post even if there is an error in retrieving ip
          $http.post(url, deviceSession).then(function(response){
            resolve({data: response.data.session_id});
          });
        });
      });
    });

  }

  this.updatePushProperties = function(pushId, pushEnabled){
    getDeviceRegistration().then(function(response){
      var device = response.data;
      device.push_id = pushId;
      device.push_enabled = pushEnabled;

      var url = buildUrl("/tsdrService/devices/:deviceId", []);
      $http.put(url, device).then(function(response){
        console.log(response);
        console.log("Push properties updated");
      });
    })
  }


  this.saveNotebook = function(notebook){
    var notebook_remote = {
      name: notebook.name,
      description: notebook.description
    }
    var url = buildUrl("/tsdrService/devices/:deviceId/notebooks");
    return $http.post(url, notebook_remote).then(function(response){
      return {data: response.data.notebook_id};
    })
  }

  this.updateNotebook = function(notebook){
    var notebook_remote = {
      notebook_id: notebook.id,
      name: notebook.name,
      description: notebook.description
    }
    var url = buildUrl("/tsdrService/devices/:deviceId/notebooks/:notebookId", [notebook.id]);
    return $http.put(url, notebook_remote).then(function(response){
      return {data: response.data.notebook_id};
    })
  }

  this.getNotebooks = function(){
    var url = buildUrl("/tsdrService/devices/:deviceId/notebooks", []);
    return $http.get(url).then(function(response){
      var notebooksRemote = response.data;
      var notebooks = [];
      notebooksRemote.forEach(function(notebookRemote){
        var notebook = Notebook.newInstance();
        notebook.id = notebookRemote.notebook_id;
        notebook.name = notebookRemote.name;
        notebook.description = notebookRemote.description;
        notebook.bookmarksCount = notebookRemote.bookmarks_count;
        notebooks.push(notebook);
      })
      return {data: notebooks};
    })
  }

  this.createBookmark = function(trademarkInfo, notebookId){
    var url = buildUrl("/tsdrService/devices/:deviceId/notebooks/:notebookId/bookmarks", [notebookId]);
    var bookmark =  Bookmark.newInstance();
    bookmark.trademarkInfo = trademarkInfo;
    var bookmarkRemote = populateRemoteBookmark(bookmark);
    return $http.post(url, bookmarkRemote).then(function(response){
      trademarkInfo.bookmarked = true;
      return response.data;
    });
  }

  this.checkStatusUpdates = function(){
    // get status updates and set the badge count
    var _this = this;
    return $q(function(resolve, reject){
      _this.getStatusUpdates().then(function(response){
        var bookmarks = response.data;
        var count = bookmarks.length;
        $rootScope.statusUpdateCount = count;
        console.log("Status Updates Count - "+count);
        $cordovaBadge.set(count).then(function() {
          console.log("We have permission to update badge count. Setting it to - "+count);
          resolve(count);
        }, function(err) {
          console.log("No permission to update badge count")
          reject(err);
        });
      }, function(err){
        reject(err);
      });
    });
  }

  function populateRemoteBookmark(bookmark){
    var trademarkInfo = bookmark.trademarkInfo;
    var bookmarkRemote = {
      bookmark_id: bookmark.id,
      notebook_id: bookmark.notebookId,
      status_updated: bookmark.statusUpdated,
      mark_id: trademarkInfo.markId,
      serial_number: trademarkInfo.serialNumber,
      registration_number: trademarkInfo.registrationNumber,
      title: trademarkInfo.title,
      status_code: trademarkInfo.status,
      status_date: trademarkInfo.statusDate,
      previous_status_code: trademarkInfo.previousStatus,
      previous_status_date: trademarkInfo.previousStatusDate,
      filing_date: trademarkInfo.filingDate,
      registration_date : trademarkInfo.registrationDate
    }
    return bookmarkRemote;
  }

  this.getBookmarksForNotebook = function(notebookId){

    var url = buildUrl("/tsdrService/devices/:deviceId/notebooks/:notebookId/bookmarks", [notebookId]);
    var bookmarks = [];
    return $http.get(url).then(function(response){
      var bookmarksRemote = response.data;
      bookmarksRemote.forEach(function(bookmarkRemote){
        bookmarks.push(populateBookmark(bookmarkRemote));
      });
      return {data: bookmarks};
    })
  }

  this.getStatusUpdates = function(){
    var url = buildUrl("/tsdrService/devices/:deviceId/statusUpdates", []);
    var bookmarks = [];
    return $http.get(url).then(function(response){
      var bookmarksRemote = response.data;
      bookmarksRemote.forEach(function(bookmarkRemote){
        bookmarks.push(populateBookmark(bookmarkRemote));
      });
      return {data: bookmarks};
    }, function(err){
      return err;
    })
  }

  this.updateBookmark = function(bookmark){
    var url = buildUrl("/tsdrService/devices/:deviceId/notebooks/:notebookId/bookmarks/:bookmarkId", [bookmark.notebookId, bookmark.id]);
    var bookmarkRemote = populateRemoteBookmark(bookmark);
    return $http.put(url, bookmarkRemote).then(function(){
      return true;
    });
  }

  this.getStatusCodes = function(statusGroupId){
    var url = buildUrl("/tsdrService/statusGroups/:groupId/statusCodes", [statusGroupId]);
    return $http.get(url);
  }

  function populateBookmark(bookmarkRemote){
    var bookmark = Bookmark.newInstance();
    var trademarkInfo = TrademarkInfo.newInstance();

    bookmark.id = bookmarkRemote.bookmark_id;
    bookmark.notebookId = bookmarkRemote.notebook_id;
    bookmark.statusUpdated = bookmarkRemote.staus_updated;
    trademarkInfo.markId = bookmarkRemote.mark_id;
    trademarkInfo.serialNumber = bookmarkRemote.serial_number;
    trademarkInfo.registrationNumber = bookmarkRemote.registration_number;
    trademarkInfo.title = bookmarkRemote.title;
    trademarkInfo.status = bookmarkRemote.status_code;
    trademarkInfo.statusDescription = bookmarkRemote.status_description;
    trademarkInfo.statusLongDescription = bookmarkRemote.status_long_description;
    trademarkInfo.statusDate = new Date(bookmarkRemote.status_date);
    trademarkInfo.statusDateStr = formatDate(trademarkInfo.statusDate);
    trademarkInfo.previousStatus = bookmarkRemote.previous_status_code;
    trademarkInfo.previousStatusDate = new Date(bookmarkRemote.previous_status_date);
    trademarkInfo.previousStatusDateStr = formatDate(trademarkInfo.previousStatusDate);
    trademarkInfo.previousStatusDescription = bookmarkRemote.previous_status_description;
    trademarkInfo.previousStatusLongDescription = bookmarkRemote.previous_status_long_description;
    trademarkInfo.filingDate = bookmarkRemote.filing_date ? new Date(bookmarkRemote.filing_date) : null;
    trademarkInfo.filingDateStr = formatDate(trademarkInfo.filingDate);
    trademarkInfo.registrationDate = bookmarkRemote.registration_date ? new Date(bookmarkRemote.registration_date) : null;
    trademarkInfo.registrationDateStr = formatDate(trademarkInfo.registrationDate);

    trademarkInfo.tsdrWebUrl = buildUrl("/tsdrService/tsdrWebPage/:serialNumber", [trademarkInfo.serialNumber]);

    bookmark.trademarkInfo = trademarkInfo;
    return bookmark;
  }

  this.searchTrademark = function(markId){
    var url = buildUrl("/tsdrService/devices/:deviceId/trademarks/:markId", [markId]);
    return $http.get(url).then(function(response){
      var trademarkRemote = response.data;
      var trademarkInfo = TrademarkInfo.newInstance();
      trademarkInfo.status = trademarkRemote.status_code;
      trademarkInfo.statusDate = new Date(trademarkRemote.status_date);
      trademarkInfo.statusDateStr = formatDate(trademarkInfo.statusDate);
      trademarkInfo.title = trademarkRemote.title;
      trademarkInfo.statusDescription = trademarkRemote.status_description;
      trademarkInfo.statusLongDescription = trademarkRemote.status_long_description;
      trademarkInfo.markId = trademarkRemote.mark_id;
      trademarkInfo.serialNumber = trademarkRemote.serial_number;
      trademarkInfo.filingDate = trademarkRemote.filing_date ? new Date(trademarkRemote.filing_date) : null;
      trademarkInfo.filingDateStr = formatDate(trademarkInfo.filingDate);
      trademarkInfo.registrationDate = trademarkRemote.registration_date ? new Date(trademarkRemote.registration_date) : null;
      trademarkInfo.registrationDateStr = formatDate(trademarkInfo.registrationDate);

      trademarkInfo.bookmarked = trademarkRemote.bookmarked;
      trademarkInfo.tsdrWebUrl = buildUrl("/tsdrService/tsdrWebPage/:serialNumber", [trademarkInfo.serialNumber]);
      return trademarkInfo;
    });
  }

  function parseDate(dateString){
    // date in the format yyyy-mm-dd
    var splits = dateString.split("-");
    var year = parseInt(splits[0]);
    var month = parseInt(splits[1])-1;
    var day = parseInt(splits[2]);
    return new Date(year, month, day, 0, 0);
  }

  function formatDate(date){
    if(date){
      return date.toString().slice(4,15)
    }
    return "";
  }

  function parseSearchText(searchText){
    var searchTokens = searchText.split(",");
    var markIds = [];
    var re8digits = /^\d{8}$/;
    var re5to7digits = /^\d{5,7}$/;
    var re8alphaNumChars = /^[A-Za-z]\d{7}$/;
    var parseSuccess = true;

    angular.forEach(searchTokens, function(token, index){
      token = token.trim();
      if(token.search(re8digits)==0) {
        markIds.push("sn"+token);
      }else if(token.search(re8alphaNumChars)==0){
        markIds.push("ref"+token);
      }else if (token.search(re5to7digits)==0){
        markIds.push("rn"+token);
      }else{
        parseSuccess = false;
      }
    })
    if(!parseSuccess){
      return undefined;
    }
    return markIds;
  }

  function getDeviceRegistration(){
    var url = buildUrl("/tsdrService/devices/:deviceId",[]);
    return $http.get(url);
  }



  function buildUrl(path, params){
    if(!params){
      params = [];
    }
    var url = $rootScope.serverBaseUrl;
    var parts = path.split("/");
    parts.forEach(function(part, index){
      if(part.indexOf(":") == 0){
        if(part == ":deviceId"){
          parts[index] = $rootScope.glDeviceId;
        }else{
          parts[index] = params.shift();
        }
      }
    })
    return url+parts.join("/");
  }

  function getRandomString()
  {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 20; i++ )
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }

  this.getPreferredStatusGroups = function() {
    var url = buildUrl("/tsdrService/devices/:deviceId/preferredStatusGroups");
    return $http.get(url).then(function(response) {
      var preferredStatusGroups = response.data;
      return {
        data: preferredStatusGroups
      };
    })
  }

  this.savePreferredStatusCodes = function(preferredStatusGroups) {
    var url = buildUrl("/tsdrService/devices/:deviceId/preferredStatusGroups");
    return $http.put(url, preferredStatusGroups).then(function(response) {
      return {
        data: response.data.id
      };
    })
  }

  this.deleteBookmarksForNotebook = function(bookmarkId) {
    var url = buildUrl("/tsdrService/bookmarks/:bookmarkId", [bookmarkId]);
    return $http.delete(url).then(function(response) {
      console.log('Successfully deleted bookmarks for notebook', response.data);
    }, function(error) {
      console.log('an error occurred', error.data);
    })
  }

  this.deleteNotebook = function(notebookId){
    var url = buildUrl("/tsdrService/notebooks/:notebookId", [notebookId])
    return $http.delete(url).then(function(response){
      return response;
    });
  }

  this.shareTrademark = function(trademarkInfo, statusUpdated){
    var subject = trademarkInfo.title;
    if(statusUpdated){
      subject = subject + " - Status Updated";
    }
    var message = "Title: "+trademarkInfo.title+"\nStatus: "+trademarkInfo.statusDescription+"\n" +
                  "Status Date: "+trademarkInfo.statusDateStr+"\n";
    if(statusUpdated){
      message = message+"\n Previous Status: "+trademarkInfo.previousStatusDescription+"\n" +
                " Previous Status Date: "+trademarkInfo.previousStatusDateStr+"\n";
    }
    var tsdrWebLink = trademarkInfo.tsdrWebUrl;
    $cordovaSocialSharing.share(message, subject, null, tsdrWebLink);
  }

  this.shareNotebook = function(notebook){
     this.getBookmarksForNotebook().then(function(response){
       var bookmarks = response.data;


     })
  }

});



