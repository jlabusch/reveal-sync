// lib/pidfile.js
//
// write() your process ID to a file or return the file name().
//
// Config: {
//   pid_dir: "/tmp"
// }
//
// You may prefer /var/run to /tmp.

var pkg     = require('../package.json'),
    log     = require('./logging'),
    config  = require('config'),
    fs      = require('fs');

function name(){
    return config.get('pid_dir') + '/' + pkg.name + '.pid';
}
exports.name = name;

exports.write = function(){
    var pidfile = name();
    fs.writeFile(pidfile, process.pid + '\n', function(err){
        if (err){
            log.error("Couldn't write process ID to " + pidfile);
        }else{
            log.info('Created ' + pidfile);
        }
    });
}

if (require.main === module){
    console.log(name());
}

