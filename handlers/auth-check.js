"use strict";

var hasAuth = require('../lib/has-auth');

module.exports = function (req, res, next) {
  if (hasAuth(req)) {
    next();
    return true;
  }
  res.redirect('/do-i-know-you');
};
