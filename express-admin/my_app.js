require('colors');

var fs = require('fs'),
    path = require('path');
var cli = require('./lib/app/cli'),
    project = require('./lib/app/project');

var express = require('express'),
    logger = require('morgan'),
    bodyParser = require('body-parser'),
    multipart = require('connect-multiparty'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    csrf = require('csurf'),
    methodOverride = require('method-override'),
    serveStatic = require('serve-static'),
    consolidate = require('consolidate'),
    hogan = require('hogan.js');

var moment = require('moment'),
    async = require('async');

var Client = require('./lib/db/client'),
    schema = require('./lib/db/schema'),
    settings = require('./lib/app/settings'),
    routes = require('./lib/app/routes');

var Xsql = require('xsql'),
    qb = require('./lib/qb'),
    dcopy = require('deep-copy');

// creates project's config files
function initCommandLine (args, cb) {
    if (!fs.existsSync(args.dpath)) {
        console.log('Config directory path doesn\'t exists!'.red);
        process.exit();
    }
    if (project.exists(args.dpath)) return cb();
    // else
    cli.promptForData(function (err, data) {
        if (err) return cb(err);
        project.create(args.dpath, data, cb);
    });
}
