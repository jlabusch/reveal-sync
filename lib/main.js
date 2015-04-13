// lib/main.js
//
// Example entry point.
//
// Config: {
//   port: 9000
// }

var cluster = require('cluster'),
    config  = require('config'),
    log     = require('./logging'),
    uuid    = require('./uuid'),
    server  = require('http').createServer(),
    io      = require('socket.io')(server);

var owners = {};

process.on('message', function(m){
    // If you want to set up handling for messages from parent processes, do that here.
    log.warn('Unhandled message from master: ' + JSON.stringify(m));
    return;
});

io.on('connection', function(sock){
    sock.on('join', function(r){
        if (!uuid.validate(r)){
            log.error(sock.id + ' invalid join(' + r + ')');
            return;
        }
        sock.join(r, function(err){
            if (err){
                log.error(sock.id + " couldn't join " + r + ': ' + err);
                return;
            }
            log.info(sock.id + ' joined ' + r);
        });
    });
    sock.on('create', function(r){
        if (!uuid.validate(r)){
            log.error(sock.id + ' invalid create(' + r + ')');
            return;
        }
        if (owners[r]){
            log.error(sock.id + " can't create " + r + ', already owned by ' + owners[r]);
            return;
        }
        owners[r] = sock.id;
        log.info(sock.id + ' created ' + r);
    });
    sock.on('nav', function(msg){
        log.info(sock.id + ' nav ' + JSON.stringify(msg));
        if (msg && uuid.validate(msg.id)){
            if (!owners[msg.id]){
                owners[msg.id] = sock.id;
                log.warn('Implicitly created ' + msg.id + ' for ' + sock.id);
            }
            if (owners[msg.id] === sock.id){
                sock.to(msg.id).emit('nav', {id: msg.id, h: msg.h, v: msg.v, f: msg.f, type: msg.type});
            }
        }
    });
    // TODO: drop if not joined in 3s
});

exports.run = function(){
    'use strict';

    server.listen(config.get('port'), function(){
        log.notice('Listening on port ' + config.get('port'));
    });
}

