"use strict";
var config = require('../config.json');

module.exports = function (req, res) {
  res.render('do-i-know-you', {
    facebook: {
      appId: config.facebook.appId,
      redirectUri: encodeURI(config.facebook.redirectUri)
    }
  });
};
