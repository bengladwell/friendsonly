"use strict";

var gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  less = require('gulp-less'),
  merge = require('merge-stream'),
  nodemon = require('nodemon'),
  babel = require('gulp-babel'),
  util = require('gulp-util'),
  sourcemaps = require('gulp-sourcemaps');

gulp.task('assets', function () {
  return merge(
    gulp.src('node_modules/normalize.css/normalize.css')
      .pipe(gulp.dest('public/css/')),
    gulp.src('node_modules/video.js/dist/video.min.js')
      .pipe(gulp.dest('public/js/')),
    gulp.src('node_modules/video.js/dist/video-js.min.css')
      .pipe(gulp.dest('public/css/'))
  );
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

gulp.task('client', function () {
  return gulp.src('client/**/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(gulp.dest('public/js/'));
});

gulp.task('serve', ['less', 'client'], function () {

  gulp.watch('src/less/**/*.less', ['less']);
  gulp.watch('client/**/*.js', ['client']);

  nodemon({
    script: 'index.js',
    stdout: false
  }).on('stdout', function (s) {
    util.log(util.colors.gray(s.toString().trim()));
  }).on('stderr', function (s) {
    util.log(util.colors.red(s.toString().trim()));
  });

});

gulp.task('default', ['assets', 'less']);
