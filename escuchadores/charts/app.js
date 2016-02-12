var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var engines = require('consolidate');


var termscloud = require('./routes/termscloud');
var promediocasos = require('./routes/promediocasos');
var descartados = require('./routes/descartados');
var desempenio = require('./routes/desempenio');
var promediorespuesta = require('./routes/promediorespuesta');
var promediotiempo = require('./routes/promediotiempo');
var nivelservicio = require('./routes/nivelservicio');
var sentiment = require('./routes/sentiment');
var desempeniohora = require('./routes/desempeniohora');
var ratings = require('./routes/ratings');

var app = express();
// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/termscloud', termscloud);
app.use('/promediocasos', promediocasos);
app.use('/descartados', descartados);
app.use('/desempenio', desempenio);
app.use('/promediorespuesta', promediorespuesta);
app.use('/promediotiempo', promediotiempo);
app.use('/nivelservicio', nivelservicio);
app.use('/sentiment', sentiment);
app.use('/desempeniohora', desempeniohora);
app.use('/ratings', ratings);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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

module.exports = app;
