var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var httpLogger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var request = require("request");
var cors = require('cors');
var dbAdapter = require("./db/dbAdapter");
var util = require("./util");
var AWS = require('aws-sdk');
var Q = require("q");
AWS.config.update({accessKeyId: 'AKIAIWISKKYMP4XY22FQ', secretAccessKey: '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', "region": "us-east-1" });


//var routes = require('./routes/index');
//var users = require('./routes/users');

var logger = util.getLogger();
var app = express();

app.use(cors());

// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(httpLogger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', routes);
// app.use('/users', users);

app.get('/', function(req, res){
logger.info("IN root");
  res.send('In root');
})

app.all('/tsdrApi/*', function(req,res) {
  //modify the url in any way you want
  logger.info("I'm in ");
  var originalUrl =  req.originalUrl;
  logger.info("original url - "+originalUrl);
  var newurl = 'https://tsdrsec.uspto.gov/ts/cd'+originalUrl.substring("/tsdrApi".length);
  logger.info("new url - "+newurl);
  //newurl = "https://tsdrsec.uspto.gov/ts/cd/casestatus/sn78787878/info.json";
  //logger.info("new url - "+newurl);
  request(newurl).pipe(res);
});

app.use("/tsdrService/*", bodyParser.json());

app.get("/tsdrService/tsdrWebPage/:serialNumber", function(req, res){
  var serialNumber = req.params.serialNumber;
  var url = "http://tsdr.uspto.gov/#caseNumber="+serialNumber+"&caseSearchType=US_APPLICATION&caseType=DEFAULT&searchType=statusSearch";
  res.redirect(url);
});

app.get("/tsdrService/tsdrAppPage/:serialNumber", function(req, res){
  var serialNumber = req.params.serialNumber;
  var url = "TSDRMobile://#/tab/search/"+serialNumber;
  res.redirect(url);
});

app.get("/tsdrService/devices/:deviceId/trademarks/:markId", function(req, res){
  logger.info("Getting trademark info for mark id  - "+req.params.markId);
  var mark_id = req.params.markId;
  var device_id = req.params.deviceId;
  dbAdapter.saveDeviceEvent(device_id, "SEARCH", mark_id);
  getTrademark(mark_id).then(function(trademarkInfo){
    dbAdapter.getBookmark(device_id, trademarkInfo.serial_number).then(function(result){
        if(result != undefined){
          trademarkInfo.bookmarked = true;
        }else{
          trademarkInfo.bookmarked = false;
        }
      res.send(trademarkInfo);
    });
  }, function(err){
    res.status(err.statusCode).send(err.message);
  });
});

app.post("/tsdrService/devices", function(req, res){
  logger.info("Posting to devices");
  var device = req.body;
  dbAdapter.saveDevice(device).then(function(deviceId){
    dbAdapter.getStatusGroups().then(function(status_groups){
      var group_ids = status_groups.map(function(group){
        return group.id;
      });
      var preferredStatusGroupsObject = {
        device_id : deviceId,
        status_groups: group_ids.join(",")
      };
      dbAdapter.saveDeviceEvent(deviceId, "DEVICE_REGISTRATION");
      dbAdapter.savePreferredStatusGroups(preferredStatusGroupsObject).then(function(result){
        res.send({device_id: deviceId});
      })
    })
  })
});

app.put("/tsdrService/devices/:id", function(req, res){
  logger.info("updating device with id - "+req.params.id);
  var deviceId = req.params.id;
  var device = req.body;
  dbAdapter.getDeviceInfo(deviceId).then(function(dbDevice){
    if(dbDevice.push_id != device.push_id){
      device.aws_endpoint_arn = null;
    }
    dbAdapter.updateDevice(device).then(function(changedRows){
      res.send();
    });
  });

});

app.get("/tsdrService/devices/:id", function(req, res){
  logger.info("getting device info for id - "+req.params.id);
  var deviceId = req.params.id;
  dbAdapter.getDeviceInfo(deviceId).then(function(device){
    res.send(device);
  })
})

app.post("/tsdrService/devices/:deviceId/sessions", function(req, res){
  logger.info("In log session");
  var deviceSession = req.body;
  deviceSession.device_id = req.params.deviceId;
  var promise =dbAdapter.saveDeviceSession(deviceSession);
  promise.then(function(session_id){
    res.send({session_id: session_id});
  })
});

app.post("/tsdrService/devices/:deviceId/notebooks", function(req, res){
  var notebook = req.body;
  notebook.device_id = req.params.deviceId;
  logger.info("In create notebook for device - "+notebook.device_id);
  var promise =dbAdapter.saveNotebook(notebook);
  promise.then(function(notebookId){
    dbAdapter.saveDeviceEvent(notebook.device_id, "CREATE_NOTEBOOK", notebookId);
    res.send({notebook_id: notebookId});
  })
});

app.put("/tsdrService/devices/:deviceId/notebooks/:notebookId", function(req, res){
  var notebook = req.body;
  notebook.device_id = req.params.deviceId;
  notebook.notebook_id = req.params.notebookId;
  logger.info("In update notebook for device - "+notebook.notebook_id);
  dbAdapter.saveDeviceEvent(notebook.device_id, "UPDATE_NOTEBOOK", notebook.notebook_id);
  var promise =dbAdapter.updateNotebook(notebook);
  promise.then(function(){
    res.send({notebook_id: notebook.notebook_id});
  });
});

app.get("/tsdrService/devices/:deviceId/notebooks", function(req, res){
  logger.info("In get notebooks");
  var device_id = req.params.deviceId;
  var promise =dbAdapter.getNotebooks(device_id);
  promise.then(function(notebooks){
    res.send(notebooks);
  })
});

app.post("/tsdrService/devices/:deviceId/notebooks/:notebookId/bookmarks", function(req, res){
  var bookmark = req.body;
  bookmark.device_id = req.params.deviceId;
  bookmark.notebook_id = req.params.notebookId;
  logger.info("In create bookmark for device - "+bookmark.device_id);
  var promise =dbAdapter.saveBookmark(bookmark);
  promise.then(function(bookmarkId){
    dbAdapter.saveDeviceEvent(bookmark.device_id, "CREATE_BOOKMARK", bookmarkId);
    res.send({bookmark_id: bookmarkId});
  })
});

app.get("/tsdrService/devices/:deviceId/notebooks/:notebookId/bookmarks", function(req, res){
  logger.info("In get bookmarks");
  var params = {
    device_id : req.params.deviceId,
    notebook_id : req.params.notebookId
  }
  var promise =dbAdapter.getBookmarks(params);
  promise.then(function(bookmarks){
    res.send(bookmarks);
  })
});

app.put("/tsdrService/devices/:deviceId/notebooks/:notebookId/bookmarks/:bookmarkId", function(req, res){
  var bookmark_id = req.params.bookmarkId;
  var bookmark = req.body;
  logger.info("In update bookmark for bookmark id - "+bookmark_id);
  dbAdapter.saveDeviceEvent(req.params.deviceId, "UPDATE_BOOKMARK", bookmark_id);
  var promise =dbAdapter.updateBookmark(bookmark)
  promise.then(function(results){
    res.send({data: results});
  })
});


app.get("/tsdrService/devices/:deviceId/statusUpdates", function(req, res){
  logger.info("In get status updates");
  var params = {
      device_id : req.params.deviceId,
      status_updated: 1
  }
  var promise =dbAdapter.getBookmarks(params);
  promise.then(function(bookmarks){
    res.send(bookmarks);
  })
});

app.delete("/tsdrService/bookmarks/:bookmarkId",function(req,res){
  var bookmark_id = req.params.bookmarkId;
  logger.info("Deleting bookmark with id - "+bookmark_id);
  dbAdapter.removeBookmark(bookmark_id).then(function(){
    res.send();
  });
});

app.delete("/tsdrService/notebooks/:notebookId", function(req, res){
  var notebook_id = req.params.notebookId;
  logger.info("Deleting notebook with id - "+notebook_id);
  dbAdapter.removeNotebook(notebook_id).then(function(){
    res.send();
  });
});

app.get("/tsdrService/statusGroups/:groupId/statusCodes", function(req, res){
  var group_id = req.params.groupId;
  logger.info("Retrieving status codes for group - "+group_id);
  dbAdapter.getStatusCodes(group_id).then(function(results){
    res.send(results);
  })
});

app.get("/tsdrService/devices/:deviceId/preferredStatusGroups", function(req, res){
  var device_id = req.params.deviceId;
  logger.info("Retrieving preferred status codes for device id - "+device_id);
  dbAdapter.getStatusGroups().then(function(status_groups){
    dbAdapter.getPreferredStatusGroups(device_id).then(function(preferred_status_groups){
      if(!preferred_status_groups){
        preferred_status_groups = {
            status_groups: ""
        }
      }
      var preferredStatusGroupsArray = preferred_status_groups.status_groups.split(",");
      status_groups.forEach(function(group){
        if(preferredStatusGroupsArray.indexOf(""+group.id) >= 0){
          group.selected = true;
        }else{
          group.selected = false;
        }
      });
      res.send(status_groups);
    });
  })
});

app.put("/tsdrService/devices/:deviceId/preferredStatusGroups", function(req, res){
  var device_id = req.params.deviceId;
  logger.info("Updated preferred status codes for device id - "+device_id);
  var preferredStatusGroups = req.body;
  var statusGroupsArray = [];
  preferredStatusGroups.forEach(function(statusGroup){
    if(statusGroup.selected){
      statusGroupsArray.push(statusGroup.id);
    }
  });
  dbAdapter.deletePreferredStatusGroups(device_id).then(function(){
    var preferredStatusGroupsObject = {
      device_id : device_id,
      status_groups: statusGroupsArray.join(",")
    };
    dbAdapter.savePreferredStatusGroups(preferredStatusGroupsObject).then(function(result){
      dbAdapter.saveDeviceEvent(req.params.deviceId, "UPDATE_PREFERRED_STATUSES");
      res.send({id: result});
    })
  })

});

app.get("/tsdrService/notifications/:deviceId", function(req, res){
  var device_id = req.params.deviceId;

  dbAdapter.getDeviceInfo(device_id).then(function(device){
    publishNotification(device).then(function(result){
      device.message_id = result;
      res.send(device);
    }, function(err){
      res.send(err);
    });
  });

});

app.get("/tsdrService/statusCodes/:deviceId", function(req, res){
  var device_id = req.params.deviceId;

  dbAdapter.getPreferredStatusCodes(device_id).then(function(results){
    res.send(results);
  });

});



app.get("/tsdrService/batches/run", function(req, res){
  runBatchStatusRefresh();
  res.send({status: "started"});
});


app.get("/tsdrService/statistics/topLevel", function(req, res){
  logger.info("Retrieving top-level statistics");
  dbAdapter.getTopLevelStatistics().then(function(result){
    res.send(result);
  });
});

// month is 1 based
app.get("/tsdrService/statistics/sessions/:year/:month", function(req, res){
  var month = req.params.month;
  var year = req.params.year;
  logger.info("Retrieving device sessions for month - "+month);
  dbAdapter.getDeviceSessionsForYearMonth(year, month).then(function(rows){
    if(!rows){
      rows = [];
    }
    var daysInAMonth= daysInMonth(month, year);
    var labels = [];
    var data = [];
    for(var i = 1; i <= daysInAMonth; i++){
      labels.push(i);
      var rowItem = rows.find(function(rItem){
        return rItem.day == i;
      });
      if(!rowItem){
        data.push(0);
      }else{
        data.push(rowItem.count);
      }
    }
    res.send({
      labels: labels,
      data: data
    });
  });
});

app.get("/tsdrService/statistics/alerts/:year", function(req, res){
  var year = req.params.year;
  logger.info("Retrieving alert statistics for year - "+year);
  dbAdapter.getAlertStats(year).then(function(rows){
    var monthsMap = getMonthsMap();
    var labels = [];
    var data = [];
    for (i in monthsMap){
      labels.push(monthsMap[i]);
      var rowItem = rows.find(function(rItem){
        return rItem.month == i
      })

      if(!rowItem){
        data.push(0);
      }else{
        data.push(rowItem.count);
      }
    }
    res.send({
      labels: labels,
      data: data
    });
  });
});

app.get("/tsdrService/statistics/bookmarks/:year", function(req, res){
  var year = req.params.year;
  logger.info("Retrieving bookmark statistics for year - "+year);
  dbAdapter.getBookmarkStats(year).then(function(rows){
    var monthsMap = getMonthsMap();
    var labels = [];
    var data = [];
    for (i in monthsMap){
      labels.push(monthsMap[i]);
      var rowItem = rows.find(function(rItem){
        return rItem.month == i
      })

      if(!rowItem){
        data.push(0);
      }else{
        data.push(rowItem.count);
      }
    }
    res.send({
      labels: labels,
      data: data
    });
  });
});


function daysInMonth(month,year) {
  return new Date(year, month, 0).getDate();
}

function getMonthsMap(){
  return {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
  }
}


function publishNotification(device){
  logger.info("Publishing Push notifications for device id - "+device.id);
  var sns = new AWS.SNS();
  var deferred = Q.defer();
  getAwsPlatformEndPoint(device).then(function(endpointArn){

    getMessagePayload(device).then(function(message){
      logger.info(message);
      sns.publish({
        Message: message,
        TargetArn: endpointArn,
        MessageStructure: "json"
      }, function(err, data){
        if(data){
          logger.info("Message Id -"+data.MessageId);
          deferred.resolve(data.MessageId);
        }else{
          logger.error(err);
          deferred.reject(JSON.stringify(err));
        }
      });
    });
  }, function(err){
    logger.error("Error retrieving endpoint arn - "+err);
    deferred.reject(err);
  });
  return deferred.promise;
}

function getMessagePayload(device){

  var deferred = Q.defer();
  var params = {
    device_id : device.id,
    status_updated: 1
  }
  dbAdapter.getBookmarks(params).then(function(bookmarks){
    var count = bookmarks.length;
    logger.info("Badge count - "+count);
    var payload;
    if(device.device_type == "Android"){
      payload = {
        GCM: JSON.stringify({
          delay_while_idle: true,
          data: {
            title: "TSDR",
            message: "Status of trademarks has changed",
            "content-available": "1",
            badge: count
          },
          "dry-run": false
        })
      }
    }else if(device.device_type == "iOS"){
      payload = {
        APNS: JSON.stringify({
          aps: {
            alert: {
              body: "Status of trademarks has changed"
            },
            sound: "default",
            badge: count,
            "content-available": 1
          },
        })
      }
    }

    var payloadStr = JSON.stringify(payload);
    deferred.resolve(payloadStr);
  }, function(err){
    deferred.reject(err);
  });
  return deferred.promise;
}

function getAwsPlatformEndPoint(device){
  var deferred = Q.defer();
  if(device.aws_endpoint_arn && device.aws_endpoint_arn != ""){
    deferred.resolve(device.aws_endpoint_arn)
  }else {
    var sns = new AWS.SNS();
    var platformApplicationArn;
    if(device.device_type == "Android"){
      platformApplicationArn = "arn:aws:sns:us-east-1:520081936223:app/GCM/TSDRMobileAndroid";
    }else if(device.device_type == "iOS"){
      platformApplicationArn = "arn:aws:sns:us-east-1:520081936223:app/APNS/TsdrMobileApple";
    }

    var params = {
      PlatformApplicationArn: platformApplicationArn,
      Token: device.push_id
    }
    sns.createPlatformEndpoint(params, function(err, data) {
      if(!err){
        var endpointArn = data.EndpointArn;
        logger.info("Endpoint ARN - "+endpointArn);
        // store endpoint arn
        dbAdapter.updateEndpointArn(endpointArn, device.id);
        deferred.resolve(endpointArn);
      }else{
        deferred.reject();
      }
    });

  }

  return deferred.promise;
}

// setInterval(runBatchStatusRefresh, 300000);

function runBatchStatusRefresh(){
  logger.info("Starting batch status refresh");
  var updatedBookmarks = [];
  var deviceStatusCodesMap = {};

  dbAdapter.getAllBookmarks().then(function(bookmarks){
    logger.info("Obtained bookmarks - "+bookmarks.length);
    var promises = [];
    bookmarks.forEach(function(bookmark){
      var url =  "https://tsdrsec.uspto.gov/ts/cd/casestatus/"+bookmark.mark_id+"/info.json";
      var deferred = Q.defer();
      request(url, function(err, response, data){
        if(!err && response.statusCode == 200){
          var trademark = JSON.parse(data).trademarks[0];
          var new_status_code = trademark.status.status;
          if(new_status_code != bookmark.status_code){
            // trademark status changed, update database and mark as dirty
            bookmark.previous_status_code = bookmark.status_code;
            bookmark.previous_status_date = bookmark.status_date;
            bookmark.status_code = new_status_code;
            bookmark.status_date = parseDate(trademark.status.statusDate);

            isUserInterestedInStatusChange(bookmark, deviceStatusCodesMap).then(function(statusChangeInterest){
              logger.info("In isUserInterestedInStatusChange success callback");
              if(statusChangeInterest){
                logger.info("User interested in status change for bookmark - "+bookmark.bookmark_id);
                bookmark.status_updated = 1;
                updatedBookmarks.push(bookmark);
              }else{
                bookmark.status_updated = 0;
              }
              dbAdapter.updateBookmark(bookmark).then(function(){
                deferred.resolve(true);
              }, function(){
                // ignore and continue
                deferred.resolve(true);
              });
            }, function(){
              // resolve in case of error
              deferred.resolve(true);
            }, function(err){
              logger.error("Error in call to isUserInterestedInStatusChange "+err);
              deferred.resolve(false);
            }).done();
          }else{
            deferred.resolve(true);
          }
        }else{
          // ignore and continue
          deferred.resolve(true);
        }
      });
      promises.push(deferred.promise);
    });
    Q.all(promises).then(function(){
      // send out push notifications for all devices that had an update
      if(updatedBookmarks.length > 0){
        var deviceNotifications = buildDeviceNotifications(updatedBookmarks);
        publishPushNotifications(deviceNotifications);
      }else{
        logger.info("None of the devices need notifications. Batch job done.");
      }
    }, function(err){
      logger.error("Error in batch process - "+err);
    }).done();

  });
}

function buildDeviceNotifications(bookmarks){
  var deviceNotifications = [];
  bookmarks.forEach(function(bookmark){
    var deviceNotification = deviceNotifications.find(function(deviceNotification){
      return deviceNotification.device_id == bookmark.device_id;
    });
    if(!deviceNotification){
      deviceNotification = {
        device_id: bookmark.device_id,
        status_change_count: 1,
        message_delivered: 0
      }
      deviceNotifications.push(deviceNotification);
    }else{
      deviceNotification.status_change_count = deviceNotification.status_change_count + 1;
    }

  });
  return deviceNotifications;
}

function isUserInterestedInStatusChange(bookmark, deviceStatusCodesMap){
  logger.info("In isUserInterestedInStatusChange");
  var device_id = bookmark.device_id;
  var new_status_code = bookmark.status_code;
  var deferred = Q.defer();

  dbAdapter.getPreferredStatusCodes(bookmark.device_id).then(function(status_codes){
    logger.info("Retrieved  Preferred Status Codes");
    deviceStatusCodesMap[bookmark.device_id] = status_codes;
    if(status_codes.length == 0){
      // no preferred status codes, so user is interested in all status changes
      deferred.resolve(true);
    }else{
      if(status_codes.indexOf(new_status_code) >= 0){
        deferred.resolve(true);
      }else{
        deferred.resolve(false);
      }
    }
  }, function(err){
    logger.info("Error in call to getPreferredStatusCodes - "+err);
    deferred.resolve(false);
  }).done();

  return deferred.promise;
}


function getTrademark(mark_id){
  var url =  "https://tsdrsec.uspto.gov/ts/cd/casestatus/"+mark_id+"/info.json";
  var deferred = Q.defer();
  request(url, function(err, response, data){
    if(!err && response.statusCode == 200) {
      var trademarkRemote = JSON.parse(data).trademarks[0];
      var statusDate = parseDate(trademarkRemote.status.statusDate);
      var filingDate = parseDate(trademarkRemote.status.filingDate);
      var registrationDate = parseDate(trademarkRemote.status.usRegistrationDate);

      var trademarkInfo = {};
      trademarkInfo.status_code = trademarkRemote.status.status;
      trademarkInfo.status_date = statusDate;
      trademarkInfo.title = trademarkRemote.status.markElement;
      trademarkInfo.status_description = "";//getStatusDescription(trademark.status.status);
      trademarkInfo.mark_id = mark_id;
      trademarkInfo.serial_number = trademarkRemote.status.serialNumber;
      trademarkInfo.filing_date = filingDate;
      trademarkInfo.registration_date = registrationDate;
      dbAdapter.getStatusCodeByCode(trademarkInfo.status_code).then(function(status_code){
        if(status_code){
          trademarkInfo.status_description = status_code.description;
          trademarkInfo.status_long_description = status_code.long_desc;
        }else{
          trademarkInfo.status_description = trademarkInfo.status_code;
          trademarkInfo.status_long_description = status_code.status_code;
        }

        deferred.resolve(trademarkInfo);
      })
    }else{
      if(!err){
        err = {};
        err.message = response.body;
        err.statusCode = response.statusCode;
      }
      deferred.reject(err);
    }
  });
  return deferred.promise;
}

function parseDate(dateString){
  // date in the format yyyy-mm-dd
  if(!dateString){
    return "";
  }
  var splits = dateString.split("-");
  var year = parseInt(splits[0]);
  var month = parseInt(splits[1])-1;
  var day = parseInt(splits[2]);
  return new Date(year, month, day, 0, 0);
}


function publishPushNotifications(deviceNotifications){
  logger.info("Sending out push notifications");
  var promises = [];
  deviceNotifications.forEach(function(deviceNotification){
    var promise = dbAdapter.getDeviceInfo(deviceNotification.device_id).then(function(device){
       logger.info("publishing notification for device id - "+device.id);
       return publishNotification(device);
    });
    promises.push(promise);
    dbAdapter.saveDeviceNotification(deviceNotification);
    // insert updatedDevice for tracking
  });
  Q.all(promises).then(function(){
    logger.info("Done sending out push notifications. Batch job is done.")
  }, function(err){
    logger.error("Error sending out push notifications. Batch job is done. "+err);
  })
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});



module.exports = app;

app.listen(process.env.PORT || 3001);
