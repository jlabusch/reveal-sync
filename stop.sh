#!/bin/bash

PIDFILE=$(node ./lib/pidfile.js)
APP=$(node -e 'console.log(require("./package.json").name)')

test -e $PIDFILE && pkill -F $PIDFILE && echo "Stopping $APP"
rm -f $PIDFILE

