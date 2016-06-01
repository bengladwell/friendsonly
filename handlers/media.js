"use strict";
var _ = require('underscore'),
  config = require('../config.json'),
  path = require('path'),
  AWS = require('aws-sdk'),
  hasAuth = require('../lib/has-auth');

module.exports = function (req, res) {
  var s3 = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    }),
    key = req.params[0],
    addToHeaders = {},
    s3req,
    readStream;

  if (!key) {
    res.sendStatus(400);
    return false;
  }

  if (!hasAuth(req)) {
    res.sendStatus(403);
    return false;
  }

  if (req.get('if-none-match')) {
    addToHeaders.IfNoneMatch = req.get('if-none-match');
  }
  if (req.get('if-match')) {
    addToHeaders.IfMatch = req.get('if-match');
  }
  if (req.get('if-modified-since')) {
    addToHeaders.IfModifiedSince = new Date(req.get('if-modified-since'));
  }
  if (req.get('if-unmodified-since')) {
    addToHeaders.IfUnmodifiedSince = req.get('if-unmodified-since');
  }
  if (req.get('range')) {
    addToHeaders.Range = req.get('range');
  }

  s3req = s3.getObject(_.extend({
    Bucket: config.aws.Bucket,
    Key: req.params[0]
  }, addToHeaders));

  s3req.on('httpHeaders', function (code, headers) {

    res.status(code);

    if (headers['content-type'] === 'application/octet-stream' && _.contains(['.mp4', '.webm', '.ogv'], path.extname(key))) {
      if (path.extname(key) === '.mp4') {
        res.set('Content-Type', 'video/mp4');
      }
    } else if (headers['content-type']) {
      res.set('Content-Type', headers['content-type']);
    }
    if (headers['last-modified']) {
      res.set('Last-Modified', headers['last-modified']);
    }
    if (headers.etag) {
      res.set('ETag', headers.etag);
    }
    if (headers['accept-ranges']) {
      res.set('Accept-Ranges', headers['accept-ranges']);
    }
    if (headers['content-range']) {
      res.set('Content-Range', headers['content-range']);
    }
    if (headers['content-length']) {
      res.set('Content-Length', headers['content-length']);
    }
  });

  readStream = s3req.createReadStream().on('error', function (err) {
    if (err.statusCode === 304) {
      return res.status(304).end();
    }
    return res.status(err.statusCode).end();
  });

  readStream.pipe(res);

};
