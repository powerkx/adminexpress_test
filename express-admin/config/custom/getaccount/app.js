
var express = require('express');
var app = module.exports = express();
var path = require('path');

var moment = require('moment');

app.set('views', path.join(__dirname, 'views'));

app.get(/\/getaccount(?:\/(\w+))?/, function (req, res, next) {
    // reuse the admin's database connection
    var db = res.locals._admin.db;
    
    showDatabase(db, function (err, rows, total) {
        if (err) return next(err);
        console.log("-----");
        res.locals.schemas = rows;
        console.log(rows);
        console.log("-----");
        next();
    });
});

app.post(/\/getaccount\/search(?:\/(\w+))?/, function (req, res, next) {
    // reuse the admin's database connection
    var db = res.locals._admin.db;
    
    console.log("333");
    var schema = req.body.schema;
    var player_name = req.body.player_name;
    console.log("444");
    
    queryDatabase(db, schema, player_name, function (err, rows, total) {
        if (err) return next(err);
        console.log("555");
        if (total != 0) {
            res.locals.results = rows;
        } else {
            var empty = [{account_id: 'No Data!', server_id: 'No Data!', server_code: 'No Data!', player_name: player_name, account: 'No Data!'}];
            res.locals.results = empty;
        }
        console.log("666");
        //next();
    });
    
    showDatabase(db, function (err, rows, total) {
        if (err) return next(err);
        console.log("-----");
        res.locals.schemas = rows;
        console.log(rows);
        console.log("-----");
        next();
    });
});

// common data for each request to this view
app.all(/\/getaccount(?:\/(\w+))?/, function (req, res, next) {
    console.log("777");
    
    var relative = path.relative(res.locals._admin.views, app.get('views'));
    
    res.locals.breadcrumbs = {
        links: [
            {url: '/', text: res.locals.string.home},
            {active: true, text: '通过角色名查询登录账号'}
        ]
    };
    
    res.locals.partials = {
        content: path.join(relative, 'form')
    };
    console.log("888");
    next();
});

function showDatabase (db, cb) {
    console.log("******");

    var sql = "show databases like '%\\_game\\_s%'";
    console.log(sql);

    db.client.query(sql, function (err, items) {
        if (err) return cb(err);
        console.log("+++");
        var rows = items;
        console.log("---");
        cb(null, rows, rows.length);
        
    });
    console.log("*****");
}

function queryDatabase (db, schema, player_name, cb) {
    console.log("@@@@@");

    var sql = "select a.account_id, a.server_id, a.server_code, b.player_name, a.account\
                 from "+schema+".player_account as a, "+schema+".player_role as b\
                 where a.account_id = b.only_id\
                 and b.player_name like '%"+player_name+"%'";

    db.client.query(sql, function (err, items) {
        if (err) return cb(err);
        
        var rows = items;
        cb(null, rows, rows.length);
        
    });
    console.log("@@@@@");
}