// lib/uuid.js
//
// UUID v4 helper functions.

var uuid = require('node-uuid');

exports.create = uuid.v4;

exports.validate = function(x){
    'use strict';
    return typeof(x) === 'string' &&
           !!x.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
}

exports.shorten = function(x){
    'use strict';
    return x ? x.replace(/^(....)(.*)(....)$/, '$1..$3') : '';
}

