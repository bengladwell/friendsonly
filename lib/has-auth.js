"use strict";
module.exports = function (req) {
  if (!req.signedCookies.auth) {
    return false;
  }
  var cookie;
  try {
    cookie = JSON.parse(req.signedCookies.auth);
  } catch (e) {
    return false;
  }
  return cookie && cookie.id && cookie.name;
};
