"use strict";
var _ = require('underscore'),
  config = require('../config.json'),
  request = require('request'),
  querystring = require('querystring');

module.exports = function (req, res) {

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

    if (!body.match(/"access_token":/)) {
      try {
        json = JSON.parse(body);
      } catch (e) {
        console.log(new Date() + ' - Error parsing possible error body');
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

    try {
      params = JSON.parse(body);
    } catch (e) {
      console.log(new Date() + ' - Error parsing access_token body');
      console.log(body);
      res.redirect('/oops');
    }

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

};
