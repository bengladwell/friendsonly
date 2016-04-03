"use strict";

var express = require('express'),
  exphbs = require('express-handlebars'),
  path = require('path'),
  //util = require('util'),
  P = require('bluebird'),
  AWS = require('aws-sdk'),
  config = require('./config.json');

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

app.get('/media/*', function (req, res) {
  var s3 = P.promisifyAll(new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      logger: process.stdout
    })),
    key = req.params[0];

  if (!key) {
    res.sendStatus(400);
    return false;
  }

  s3.headObjectAsync({
    Bucket: config.aws.Bucket,
    Key: key
  }).then(function (head) {

    // handle ETag caching
    if (req.get('If-None-Match') === head.ETag) {
      res.sendStatus(304);
      return true;
    }

    res.set('Content-Length', head.ContentLength);
    res.set('ETag', head.ETag);
    res.set('Cache-Control', 'max-age=172800'); // 2 days

    // stream videos
    if (head.ContentType === 'application/octet-stream' && path.extname(key) === '.mp4') {

      res.set('Content-Type', 'video/mp4');
      s3.getObject({
        Bucket: config.aws.Bucket,
        Key: req.params[0]
      }).createReadStream().pipe(res);

    } else {

      res.set('Content-Type', head.ContentType);

      s3.getObjectAsync({
        Bucket: config.aws.Bucket,
        Key: req.params[0]
      }).then(function (d) {
        res.send(d.Body);
      });

    }

  }, function (err) {
    res.sendStatus(err.statusCode);
  });
});

app.listen(3000);
