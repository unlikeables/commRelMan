// require('console-stamp')(console, '[HH:MM:ss.1]');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var getdm = require('./routes/getdm');
var getpb = require('./routes/getpb');
var getom = require('./routes/getom');
var getol = require('./routes/getol');
var getoc = require('./routes/getoc');
var getos = require('./routes/getos');
var getof = require('./routes/getof');
var gettt = require('./routes/gettt');
var gettl = require('./routes/gettl');
var deldup = require('./routes/deldup');
var getautomu = require('./routes/getautomu');
var getautofi = require('./routes/getautofi');
var getautocp = require('./routes/getautocp');
var getautopp = require('./routes/getautopp');
var getdesempenio = require('./routes/getdesempenio');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/getdm', getdm);
app.use('/getpb', getpb);
app.use('/getom', getom);
app.use('/getol', getol);
app.use('/getoc', getoc);
app.use('/getos', getos);
app.use('/getof', getof);
app.use('/gettt', gettt);
app.use('/gettl', gettl);
app.use('/deldup', deldup);
app.use('/getautomu', getautomu);
app.use('/getautofi', getautofi);
app.use('/getautocp', getautocp);
app.use('/getautopp', getautopp);
app.use('/getdesempenio', getdesempenio);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/*
app.use(function(req, res, next) {
    res.setTimeout(900000, function(){
	console.log('Request has timed out.');
	res.send(408);
    });
    next();
});
*/

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
