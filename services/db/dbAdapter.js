var mysql = require("mysql");
var toUnnamed = require('named-placeholders')();
var Q = require("q");
var util = require("../util");

var pool  = mysql.createPool(
    //getDbInfo()
    getDockerDbInfo()
);

function getDbInfo(){
    return {
        host     : '127.0.0.1',
        user     : 'root',
        password : '',
        database : "tsdr_mobile"
    }
}

function getDockerDbInfo(){
    return{
        host     : 'tsdr-db',
        user     : 'root',
        password : 'AEEC2016',
        database : "tsdr_mobile"
    }
}

function getProdDbInfo(){
    return {
        host     : 'edh2.chimup87vxa8.us-east-1.rds.amazonaws.com',
        user     : 'edhadmin',
        password : 'AEEC2015',
        database : "tsdr_mobile"
    }
}

var logger = util.getLogger();

exports.saveNotebook = function(notebook){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "insert into NOTEBOOKS set ? ", notebook);
    }).then(function(results){
        logger.info("Query success - "+results[0].insertId);
        _connection.release();
        return results[0].insertId;
    });
}

exports.updateNotebook = function(notebook){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        var query = "update NOTEBOOKS set name = :name, description = :description where notebook_id = :notebook_id";
        var qp = toUnnamed(query, notebook);
        return Q.nfcall(connection.query.bind(connection), qp[0], qp[1]);
    }).then(function(results){
        logger.info("Query success - "+results[0].changedRows);
        _connection.release();
        return results[0].changedRows;
    });
}

exports.getNotebooks = function(device_id){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select note.*, count(marks.bookmark_id) as bookmarks_count from NOTEBOOKS note left join BOOKMARKS marks on note.notebook_id = marks.notebook_id where note.device_id = ? group by note.notebook_id", [device_id]);
    }).then(function(results){
        _connection.release();
        return results[0];
    });
}

exports.saveBookmark = function(bookmark){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        logger.info("connection success");
        return Q.nfcall(connection.query.bind(connection), "insert into BOOKMARKS set ? ", bookmark);
    }).then(function(results){
        logger.info("Query success - "+results[0].insertId);
        _connection.release();
        return results[0].insertId;
    });
}

exports.updateBookmark = function(bookmark){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        var query = "update BOOKMARKS set status_code = :status_code, status_date = :status_date, previous_status_code = :previous_status_code, previous_status_date = :previous_status_date, status_updated = :status_updated  where bookmark_id = :bookmark_id";
        var qp = toUnnamed(query, bookmark);
        return Q.nfcall(connection.query.bind(connection), qp[0], qp[1]);
    }).then(function(results){
        _connection.release();
        return results[0].changedRows;
    }, function(err){
        _connection.release();
        logger.info(err);
        return err;
    });
}

exports.removeBookmark = function(bookmarkId){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "delete from BOOKMARKS where bookmark_id = ? ", [bookmarkId]);
    }).then(function(results){
        _connection.release();
       return results[0].affectedRows;
    });
}

exports.getBookmarks = function(params){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        connection.config.namedPlaceholders = true;
        var query = "select bookmark.*, coalesce(status_code.description, bookmark.status_code) as status_description, coalesce(status_code.long_desc, bookmark.status_code) as status_long_description, coalesce(previous_status_code.description, bookmark.previous_status_code) as previous_status_description, coalesce(previous_status_code.long_desc, bookmark.previous_status_code) as previous_status_long_description from BOOKMARKS bookmark "+
                        " left join STATUS_CODES status_code on bookmark.status_code = status_code.code"+
                        " left join STATUS_CODES previous_status_code on bookmark.previous_status_code = previous_status_code.code" +
                        " where bookmark.device_id = :device_id " ;
        if(params.notebook_id){
            query = query + " and bookmark.notebook_id = :notebook_id "
        }
        if(params.status_updated){
            query = query + "and bookmark.status_updated = :status_updated"
        }
        var qp = toUnnamed(query, params);

        return Q.nfcall(connection.query.bind(connection), qp[0], qp[1]);
    }).then(function(results){
        _connection.release();
        return results[0];
    },function(err){
        _connection.release();
        logger.info(err);
        return err;
    });
}

exports.getAllBookmarks = function(){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select * from BOOKMARKS");
    }).then(function(results){
        _connection.release();
        return results[0];
    });
}


exports.removeNotebook = function(notebook_id){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        var bookmarkDeletePromise = Q.nfcall(connection.query.bind(connection), "delete from BOOKMARKS where notebook_id = ? ", [notebook_id]);
        var notebookDeletePromise = Q.nfcall(connection.query.bind(connection), "delete from NOTEBOOKS where notebook_id = ? ", [notebook_id]);
        return Q.all([bookmarkDeletePromise, notebookDeletePromise]);
    }).then(function(results){
        _connection.release();
        return true;
    });
}

exports.saveDevice = function(device){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "insert into DEVICES set ? ", device);
    }, function(err){
        logger.info(err);
    }).then(function(results){
        _connection.release();
       return results[0].insertId;
    });
}

exports.updateDevice = function(device){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection),
                            "update DEVICES set app_id = ?, push_id = ?, push_enabled = ?, device_type = ?, device_os = ?, aws_endpoint_arn = ?, update_date = now() where id = ? ",
                                [device.app_id, device.push_id, device.push_enabled, device.device_type, device.device_os, device.aws_endpoint_arn, device.id]);
    }).then(function(results){
        _connection.release();
        return results[0].changedRows;
    });
}

exports.updateEndpointArn = function(endpointArn, deviceId){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection),
            "update DEVICES set aws_endpoint_arn = ?, update_date = now() where id = ? ",
            [endpointArn, deviceId]);
    }).then(function(results){
        _connection.release();
        return results[0].changedRows;
    });

}

exports.getBookmark = function(device_id, serial_number){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection),
            "select * from BOOKMARKS where device_id = ? and serial_number = ?",
            [device_id,serial_number]);
    }).then(function(results){
        _connection.release();
        return results[0][0];
    }, function(err){
        _connection.release();
        logger.info(err);
        return err;
    });
}

exports.getDeviceInfo = function(deviceId){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection),
            "select * from DEVICES where id = ?",
            [deviceId]);
    }).then(function(results){
        _connection.release();
        return results[0][0];
    });
}

exports.getStatusGroups = function(){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select * from STATUS_GROUPS");
    }).then(function(results){
        _connection.release();
        return results[0];
    });
}

exports.getPreferredStatusGroups = function(device_id){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select * from PREFERRED_STATUS_GROUPS where device_id = ?", [device_id]);
    }).then(function(results){
        _connection.release();
        return results[0][0];
    });
}

exports.saveDeviceNotification = function(deviceNotification){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "insert into DEVICE_NOTIFICATIONS set ? ", deviceNotification);
    }, function(err){
        logger.info(err);
    }).then(function(results){
        _connection.release();
        return results[0].insertId;
    });
}

exports.saveDeviceSession = function(deviceSession){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "insert into DEVICE_SESSIONS set ? ", deviceSession);
    }, function(err){
        logger.info(err);
    }).then(function(results){
        _connection.release();
        return results[0].insertId;
    });
}

exports.saveDeviceEvent = function(device_id, event_type, event_data){
    var deviceEvent = {
        device_id: device_id,
        event_type: event_type,
        event_data: event_data
    }
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "insert into DEVICE_EVENTS set ? ", deviceEvent);
    }, function(err){
        logger.info(err);
    }).then(function(results){
        _connection.release();
        return results[0].insertId;
    }, function(err){
        logger.error(err);
    });
}

exports.getPreferredStatusCodes = function(device_id){
    return this.getPreferredStatusGroups(device_id).then(function(preferred_groups){
        if(preferred_groups){
            var preferred_group_ids_string = preferred_groups.status_groups;
            var _connection;
            return getConnection().then(function(connection){
                _connection = connection;
                var query = "select code from STATUS_CODES sc where sc.status_group_id in ("+preferred_group_ids_string+")";
                var qp = toUnnamed(query, {statusGroups: preferred_group_ids_string});
                return Q.nfcall(connection.query.bind(connection), query, []);
            }).then(function(results){
                _connection.release();
                return results[0].map(function(result){
                    return parseInt(result.code);
                });
            }, function(err){
                _connection.release();
                logger.info(err);
                return err;
            });
        }else{
            return [];
        }
    }, function(err){
        logger.info("Error in call to getPreferredStatusGroups - "+err);
    });
}

exports.savePreferredStatusGroups = function(preferred_status_group){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "insert into PREFERRED_STATUS_GROUPS set ? ", preferred_status_group);
    }).then(function(results){
        _connection.release();
        return results[0].insertId;
    });
}

exports.deletePreferredStatusGroups = function(device_id){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "delete from PREFERRED_STATUS_GROUPS where device_id = ? ", [device_id]);
    }).then(function(results){
        _connection.release();
        return results[0].affectedRows;
    });
}

exports.getStatusCodes = function(group_id){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select * from STATUS_CODES where status_group_id = ?", [group_id]);
    }).then(function(results){
        _connection.release();
        return results[0];
    });
}

exports.getStatusCodeByCode = function(code){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select * from STATUS_CODES where code = ?", [code]);
    }).then(function(results){
        _connection.release();
        return results[0][0];
    });
}

exports.getTopLevelStatistics = function(){
    var statistics = {};
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        var q1 = Q.nfcall(connection.query.bind(connection), "select count(*) as count from DEVICES where id >= 170");
        var q2 = Q.nfcall(connection.query.bind(connection), "select count(*) as count from BOOKMARKS");
        var q3 = Q.nfcall(connection.query.bind(connection), "select sum(status_change_count) as count from DEVICE_NOTIFICATIONS");
        var q4 = Q.nfcall(connection.query.bind(connection), "select count(*) as count from DEVICE_EVENTS where event_type = ?", ["SEARCH"]);
        return Q.all([q1, q2, q3, q4]);
    }).then(function(qResults){
        _connection.release();
        statistics.devices = qResults[0][0][0].count;
        statistics.bookmarks = qResults[1][0][0].count;
        statistics.notifications = qResults[2][0][0].count;
        statistics.searches = qResults[3][0][0].count;
        return statistics;
    });
}

exports.getDeviceSessionsForYearMonth = function(year, month){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select DAYOFMONTH(start_date) as day, count(1) as count from DEVICE_SESSIONS where year(start_date) = ? and month(start_date) = ? group by DAYOFMONTH(start_date)", [year, month]);
    }).then(function(results){
        _connection.release();
        return results[0];
    }, function(err){
        logger.error(err);
        return err;
    });
}

exports.getAlertStats = function(year){
    var _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select month(create_date) as month, sum(status_change_count) as count from DEVICE_NOTIFICATIONS where year(create_date) = ? group by month(create_date)", [year]);
    }).then(function(results){
        _connection.release();
        return results[0];
    }, function(err){
        logger.error(err);
        return err;
    });
}

exports.getBookmarkStats = function(year){
    var
        _connection;
    return getConnection().then(function(connection){
        _connection = connection;
        return Q.nfcall(connection.query.bind(connection), "select month(event_date) as month, count(1) as count from DEVICE_EVENTS where event_type = 'CREATE_BOOKMARK' and year(event_date) = ? group by month(event_date)", [year]);
    }).then(function(results){
        _connection.release();
        return results[0];
    }, function(err){
        logger.error(err);
        return err;
    });
}



exports.insertStatusCodes = function(statusCodes){

    var groups = {}; // {groups_code: group_label}
    var groupCodesToIds = {}; // {group_code: gen_id}
    for(i in statusCodes){
        var statusCode = statusCodes[i];
        var splits = statusCode.split("|");
        var groupLabel = splits[2];
        var groupCode = splits[3];

        if(groups[groupCode] === undefined){
            groups[groupCode] = groupLabel;
        }
    }
    logger.info(JSON.stringify(groups));


    var groupsInsertQ = getConnection().then(function(connection){
        var groupQList = [];
        Object.keys(groups).forEach(function(group_code){
            var groupInsert = {
                code: group_code,
                label: groups[group_code]
            }
            logger.info("inserting group- "+ JSON.stringify(groupInsert));

            var promise = Q.nfcall(connection.query.bind(connection), "insert into STATUS_GROUPS set ? ", groupInsert).then(function(results){
                logger.info("group code to id ampping - "+group_code + " - "+results[0].insertId);
                groupCodesToIds[group_code] = results[0].insertId;
                return results[0].insertId;
            }) ;
            groupQList.push(promise);
        });
        return Q.all(groupQList).then(function(){
            connection.release();
            return true;
        })
    });

    groupsInsertQ.then(function(){
        logger.info("Groups codes to Ids - "+JSON.stringify(groupCodesToIds));
        var promiseList = [];
        getConnection().then(function(connection){
            for(i in statusCodes) {
                var statusCode = statusCodes[i];
                var splits = statusCode.split("|");
                var code = splits[0];
                var desc = splits[1];
                var groupCode = splits[3];
                var groupId = groupCodesToIds[groupCode];

                var statusInsert = {
                    code: code,
                    description: desc,
                    status_group_id: groupId
                }
                logger.info("inserting status - "+JSON.stringify(statusInsert));
                var promise = Q.nfcall(connection.query.bind(connection), "insert into STATUS_CODES set ? ", statusInsert).then(function(results){
                    return results[0].insertId;
                });
                promiseList.push(promise);
            }
            Q.all(promiseList).then(function(){
                connection.release();
            });
        });
    });


}


function getConnection(){
     return Q.nfcall(pool.getConnection.bind(pool));
}

