"use strict";

var express = require('express'),
  exphbs = require('express-handlebars');

var app = express();

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');

app.use(express['static']('public'));

app.get('/', function (req, res) {
  res.render('home');
});

app.listen(3000);
