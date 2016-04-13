"use strict";

var express = require('express'),
  cookieParser = require('cookie-parser'),
  exphbs = require('express-handlebars'),
  //util = require('util'),
  config = require('./config.json'),

  homeHandler = require('./handlers/home'),
  videoHandler = require('./handlers/video'),
  doIKnowYouHandler = require('./handlers/do-i-know-you'),
  oopsHandler = require('./handlers/oops'),
  iDoNotKnowYouHandler = require('./handlers/i-do-not-know-you'),
  oauthHandler = require('./handlers/oauth'),
  mediaHandler = require('./handlers/media'),
  authCheckHandler = require('./handlers/auth-check');

var app = express();

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');

app.use(cookieParser(config.secret));
app.use(express['static']('public'));

app.get('/', authCheckHandler, homeHandler);
app.get('/video/:slug', authCheckHandler, videoHandler);
app.get('/do-i-know-you', doIKnowYouHandler);
app.get('/oops', oopsHandler);
app.get('/i-do-not-know-you', iDoNotKnowYouHandler);
app.get('/oauth', oauthHandler);
app.get('/media/*', mediaHandler);

app.listen(3000);
