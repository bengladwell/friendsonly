"use strict";
var media = require('../media.json');

module.exports = function (req, res) {
  res.render('home', {media: media});
};
