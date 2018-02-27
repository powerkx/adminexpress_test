
var express = require('express');
var app = module.exports = express();
var path = require('path');

var moment = require('moment');

app.set('views', path.join(__dirname, 'views'));

app.get(/\/gettoplevel(?:\/(\w+))?/, function (req, res, next) {
    // reuse the admin's database connection
    var db = res.locals._admin.db;
    
    showDatabase(db, function (err, rows, total) {
        if (err) return next(err);
        res.locals.schemas = rows;
        next();
    });
});

app.post(/\/gettoplevel\/search(?:\/(\w+))?/, function (req, res, next) {
    // reuse the admin's database connection
    var db = res.locals._admin.db;
    
    var schema = req.body.schema;
    var quantity = req.body.quantity;
    
    queryDatabase(db, schema, quantity, function (err, rows, total) {
        if (err) return next(err);
        if (total != 0) {
            res.locals.results = rows;
        } else {
            var empty = [{account_id: 'No Data!', server_id: 'No Data!', server_code: 'No Data!', 
                          player_name: 'No Data!', level: 'No Data!', account: 'No Data!'}];
            res.locals.results = empty;
        }
    });
    
    showDatabase(db, function (err, rows, total) {
        if (err) return next(err);
        res.locals.schemas = rows;
        next();
    });
});

// common data for each request to this view
app.all(/\/gettoplevel(?:\/(\w+))?/, function (req, res, next) {
    
    var relative = path.relative(res.locals._admin.views, app.get('views'));
    
    res.locals.breadcrumbs = {
        links: [
            {url: '/', text: res.locals.string.home},
            {active: true, text: '查询最高等级的登录账号'}
        ]
    };
    
    res.locals.partials = {
        content: path.join(relative, 'form')
    };
    next();
});

function showDatabase (db, cb) {

    var sql = "show databases like '%\\_game\\_s%'";

    db.client.query(sql, function (err, items) {
        if (err) return cb(err);
        var rows = items;
        cb(null, rows, rows.length);
        
    });
}

function queryDatabase (db, schema, quantity, cb) {

    var sql = "select a.only_id,b.server_id,b.server_code,a.player_name,a.level,b.account\
                 from "+schema+".player_role as a, "+schema+".player_account as b\
                 where a.only_id = b.account_id\
                 order by a.level desc\
                 limit "+quantity;

    db.client.query(sql, function (err, items) {
        if (err) return cb(err);
        
        var rows = items;
        cb(null, rows, rows.length);
        
    });
}