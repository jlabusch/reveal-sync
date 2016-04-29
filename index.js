// index.js
//
// Handles daemonizing and clustering. In each worker process control is passed to ./lib/main.js.
//
// Config: {
//   daemon: true,
//   workers: 1
// }

var config = require('config');

if (config.get('daemon')){
    require('daemon')();
}

var cluster = require('cluster'),
    log     = require('./lib/logging');

if (config.get('cluster') && cluster.isMaster){
    require('./lib/pidfile').write();

    function spawn_child(){
        var w = cluster.fork();
        w.on('message', function(m){
            // If you want to set up handling for messages from child processes, do that here.
            log.warn('cluster: Unhandled message from child: ' + JSON.stringify(m));
        });
        log.warn('cluster: spawned worker ' + w.id + ' (PID ' + w.process.pid + ')');
        return w;
    }

    for (var i = 0; i < config.get('workers'); ++i){
        spawn_child();
    }

    cluster.on('exit', function(worker, code, signal){
        log.error('cluster: worker PID ' + worker.process.pid + ' died (' + (signal || code) + ')');
        setTimeout(spawn_child, 500);
    });
}else{
    require('./lib/main').run();
}
