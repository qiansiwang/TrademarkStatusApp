var winston = require("winston");

var logs_dir = process.env.TSDR_LOGS_DIR || "../logs";
var logger = new winston.Logger({
    level: 'debug',
    transports: [
        new (winston.transports.File)({name: "debug_file", filename: logs_dir+'/debug.log', level: 'debug', json: false }),
        new (winston.transports.File)({name: "error_file", filename: logs_dir+'/error.log', level: 'error', json: false })
    ]
});

exports.getLogger = function(){
    return logger;
}