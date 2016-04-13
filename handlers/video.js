"use strict";
var _ = require('underscore'),
  media = require('../media.json');

module.exports = function (req, res) {
  var med = _.findWhere(media, {slug: req.params.slug});
  res.render('video', med);
};
