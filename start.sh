#!/bin/bash

PIDFILE=$(node ./lib/pidfile.js)
APP=$(node -e 'console.log(require("./package.json").name)')

if test -n "$1"; then
    export NODE_ENV=$1
fi
echo "NODE_ENV=$NODE_ENV"

if [ -e $PIDFILE ]; then
    PID=$(cat $PIDFILE)
    if [ -z "$PID" ]; then
        echo "Cleaning up empty PID file $PIDFILE" >&2
        rm -f $PIDFILE
    elif pmap "$PID" | grep -q node; then
        echo "Not starting $APP, running PID $PID" >&2
        exit 1
    else
        echo "Process $PID no longer running; deleting $PIDFILE" >&2
        rm -f $PIDFILE
    fi
fi
echo "Starting $APP" >&2
node ./index.js

exit 0
