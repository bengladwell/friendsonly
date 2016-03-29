"use strict";

var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  less = require('gulp-less'),
  util = require('gulp-util'),
  sourcemaps = require('gulp-sourcemaps');

gulp.task('assets', function () {
  return gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(gulp.dest('public/css/'));
});

gulp.task('less', function () {
  return gulp.src('src/less/main.less')
    .pipe(plumber({
      errorHandler: function (err) {
        util.log(util.colors.red(err));
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(less({
      paths: ['bower_components/bootstrap/less/'],
      compress: process.env.NODE_ENV !== 'development'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css/'));
});


gulp.task('default', ['assets', 'less']);
