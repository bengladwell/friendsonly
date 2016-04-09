"use strict";

var express = require('express'),
  cookieParser = require('cookie-parser'),
  exphbs = require('express-handlebars'),
  path = require('path'),
  //util = require('util'),
  _ = require('underscore'),
  request = require('request'),
  querystring = require('querystring'),
  P = require('bluebird'),
  AWS = require('aws-sdk'),
  config = require('./config.json');

var app = express();

app.engine('hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs'
}));
app.set('view engine', 'hbs');

app.use(cookieParser(config.secret));
app.use(express['static']('public'));

app.get('/', function (req, res) {
  res.render('home');
});

app.get('/do-i-know-you', function (req, res) {
  res.render('do-i-know-you', {
    facebook: {
      appId: config.facebook.appId,
      redirectUri: encodeURI(config.facebook.redirectUri)
    }
  });
});

app.get('/oops', function (req, res) {
  res.render('oops', {
    facebook: {
      appId: config.facebook.appId,
      redirectUri: encodeURI(config.facebook.redirectUri)
    }
  });
});

app.get('/i-do-not-know-you', function (req, res) {
  res.render('i-do-not-know-you');
});

app.get('/oauth', function (req, res) {

  if (!req.query.code) {
    // something went wrong with getting code
    console.log(new Date() + ' - arrived at /oauth without code');
    res.redirect('/oops');
    return false;
  }

  request.get('https://graph.facebook.com/oauth/access_token?' + querystring.stringify({
    client_id: config.facebook.appId,
    redirect_uri: config.facebook.redirectUri,
    client_secret: config.facebook.appSecret,
    code: req.query.code
  }), function (err, resp, body) {
    var json,
      params;

    if (err) {
      console.log(new Date() + ' - error getting access_token: ' + err);
      res.redirect('/oops');
      return false;
    }

    if (!body.match(/access_token=/)) {
      try {
        json = JSON.parse(body);
      } catch (e) {
        console.log(new Date() + ' - Error parsing access_token body');
        res.redirect('/oops');
        return false;
      }

      if (json.error) {
        console.log(new Date() + ' - json.error:' + json.error);
        res.redirect('/oops');
        return false;
      }

      console.log(new Date() + ' - Unknown response from FB');
      console.log(json);
      res.redirect('/oops');
    }

    params = querystring.parse(body);

    // is this the owner?
    request.get('https://graph.facebook.com/me?' + querystring.stringify({
      access_token: params.access_token,
      fields: 'id,name'
    }), function (meErr, meResp, meBody) {

      if (meErr) {
        console.log(new Date() + ' - Error fetching profile data');
        console.log(meErr);
        res.redirect('/oops');
        return false;
      }

      try {
        json = JSON.parse(meBody);
      } catch (e) {
        console.log(new Date() + ' - Error parsing meBody');
        console.log(meBody);
        res.redirect('/oops');
        return false;
      }

      if (json.error) {
        console.log(new Date() + ' - Error fetching profile data: ' + json.error.message);
        res.redirect('/oops');
        return false;
      }

      if (json.id === config.facebook.ownerUserId) {
        res.cookie('auth', meBody, {
          maxAge: 1000 * 60 * 60 * 24 * 30 * 2, // 2 months
          signed: true
        });
        // TODO - check state for redirect
        res.redirect('/');
        return true;
      }

      request.get('https://graph.facebook.com/me/friends?' + querystring.stringify({
        access_token: params.access_token,
        fields: "id"
      }), function (friendsErr, friendsResp, friendsBody) {

        if (friendsErr) {
          console.log(new Date() + ' - Error fetching friends');
          console.log(friendsErr);
          res.redirect('/oops');
          return false;
        }

        try {
          json = JSON.parse(friendsBody);
        } catch (e) {
          console.log(new Date() + ' - Error parsing friendsBody');
          console.log(friendsBody);
          res.redirect('/oops');
          return false;
        }

        if (json.error) {
          console.log(new Date() + ' - Error fetching friends: ' + json.error.message);
          res.redirect('/oops');
          return false;
        }

        // is this account friends with the owner?
        if (_.findWhere(json.data, {id: config.facebook.ownerUserId})) {
          res.cookie('auth', meBody, {
            maxAge: 1000 * 60 * 60 * 24 * 30 * 2, // 2 months
            signed: true
          });
          // TODO - check state for redirect
          res.redirect('/');
          return true;
        }

        res.redirect('/i-do-not-know-you');
        return false;
      });
    });

  });

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
