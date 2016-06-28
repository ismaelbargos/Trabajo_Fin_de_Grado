var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var mongo = require('mongodb');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var session      = require('express-session');
var flash    = require('connect-flash');

mongoose.connect('mongodb://localhost/API-EMT');
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();


//View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//BodyParser Middleware
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


//Set static Folder
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('public/javascripts', express.static(path.join(__dirname, 'public/javascripts')));
app.use('public/stylesheets', express.static(path.join(__dirname, 'public/stylesheets')));
app.use('public/html', express.static(path.join(__dirname, 'public/html')));
app.use('public/images',express.static(path.join(__dirname, 'public/images')));

//Express Session
app.use(session({ secret: 'secret', resave: true, saveUninitialized: true }));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', users);

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
