// lib/logging.js
//
// A bunyan-compatible logging module that can use stdout or syslog.
//
// Config: {
//   log: {
//     facility: "local4",
//     level: "info"   /* log messages that are at least this serious */
//   }
// }

var syslog  = require('modern-syslog');
    util    = require('util'),
    pkg     = require('../package.json'),
    uuid    = require('./uuid'),
    cluster = require('cluster'),
    config  = require('config');

var priority_name_to_num = {
    'debug':  syslog.LOG_DEBUG,   // Anything goes
    'info':   syslog.LOG_INFO,    // e.g. detailed transaction logic traces
    'notice': syslog.LOG_NOTICE,  // e.g. HTTP traces
    'warn':   syslog.LOG_WARNING, // e.g. an error during a single login POST
    'error':  syslog.LOG_ERR,     // e.g. service configuration fundamentally broken, exiting
    'crit':   syslog.LOG_CRIT     // They sky is falling
};

var facility_name_to_num = {
    'local0': syslog.LOG_LOCAL0,
    'local1': syslog.LOG_LOCAL1,
    'local2': syslog.LOG_LOCAL2,
    'local3': syslog.LOG_LOCAL3,
    'local4': syslog.LOG_LOCAL4,
    'local5': syslog.LOG_LOCAL5,
    'local6': syslog.LOG_LOCAL6,
    'local7': syslog.LOG_LOCAL7
};

var done_init = false,
    use_console = config.get('log.facility') === 'stdout';

function init(){
    'use strict';
    if (!done_init && !use_console){
        syslog.init(pkg.name, syslog.LOG_PID, facility_name_to_num[config.get('log.facility')]);
        done_init = true;
    }
}

function log(pri, msg){
    'use strict';
    init();

    var id = cluster.isMaster ? 'master' : cluster.worker.id,
        level = priority_name_to_num[config.get('log.level')],
        p = priority_name_to_num[pri];

    if (msg && p <= level){
        if (use_console){
            console.log(id + '.' + pri + '| ' + msg);
        }else{
            syslog.log(p, id + '.' + pri + '| ' + msg);
        }
    }
    return p <= level;
}

function str_or_dash(x){
    'use strict';
    return x || '-';
}

function bunyan_audit(a){
    'use strict';
    var time = 0;
    if (a.req.timers){
        a.req.timers.forEach(function(t){
            time += 1000000*t.time[0] + t.time[1]/1000;
        });
        if (time){
            time = Math.round(time/1000) + 'ms';
        }
    }
    var len = a.res._headers['content-length'];
    if (len){
        len += ' bytes';
    }
    return [
        str_or_dash(a.req.connection.remoteAddress),
        a.req.method,
        a.req.url,
        str_or_dash(uuid.shorten(a.req.token)),
        str_or_dash(a.res.statusCode),
        str_or_dash(len),
        str_or_dash(time)
    ].join(' ');
}

function bunyan(pri){
    return function(){
        'use strict';
        var text = undefined,
            args = Array.prototype.slice.call(arguments, 0);
        // Ignore noise
        if (pri === 'debug' &&
            (args.length === 2 &&
                args[0] === 'running %s' && args[1].match(/^(serve|sent|parseBody|readBody)$/))
        ){
            return;
        }
        if (args[0] instanceof Error){
            text = args[0].message;
        }else if (typeof(args[0]) !== 'object' && args[0] !== null || Array.isArray(args[0])){
            text = util.format.apply(this, args);
        }else if (Buffer.isBuffer(args[0])){
            text = util.inspect(args[0]);
        }else{
            if (args && args[0] && args[0]._audit){
                text = bunyan_audit(args[0]);
            }else if (args && args[1] && (''+args[1]) === 'uncaughtException'){
                text = args[0].err;
            }else{
                args.shift();
                text = util.format.apply(this, args);
            }
        }
        return log(pri, text);
    }
}

module.exports  = (function(){
    var o = {
        log: log,
        trace:  bunyan('debug'),
        debug:  bunyan('debug'),
        info:   bunyan('info'),
        notice: bunyan('info'),
        warn:   bunyan('warn'),
        error:  bunyan('error'),
        fatal:  bunyan('crit'),
        crit:   bunyan('crit'),
        child:  function(){ return o; }
    }

    return o;
})();

