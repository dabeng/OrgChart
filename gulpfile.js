// const gulp = require('gulp');
// const mocha = require('gulp-mocha');

// gulp.task('default', () => {
//   gulp.src(['test/**/*-tests.js'], {read: false})
//     .pipe(mocha({reporter: 'spec'}));
// });

var gulp = require('gulp');
var inject = require('gulp-inject');
var browserSync = require('browser-sync').create();
var paths = {
  src: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcCSS: 'src/**/*.css',
  srcJS: 'src/**/*.js',
  tmp: 'tmp',
  tmpHTML: 'tmp/**/*.html',
  tmpCSSFolder: 'tmp/css',
  tmpCSS: 'tmp/**/*.css',
  tmpJSFolder: 'tmp/js',
  tmpJS: 'tmp/**/*.js',
  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/**/*.css',
  distJS: 'dist/**/*.js'
};

gulp.task('default', function () {
  console.log('Hello World!');
});

gulp.task('html', function () {
  return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.tmp));
});

gulp.task('css', function () {
  return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.tmp));
});

gulp.task('vendorCSS', function () {
  return gulp.src(['node_modules/font-awesome/css/font-awesome.min.css'])
    .pipe(gulp.dest(paths.tmpCSSFolder));
});

gulp.task('js', function () {
  return gulp.src(paths.srcJS).pipe(gulp.dest(paths.tmp));
});

gulp.task('vendorJS', function () {
  return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/jquery-mockjax/dist/jquery.mockjax.min.js'])
    .pipe(gulp.dest(paths.tmpJSFolder));
});

gulp.task('vendorAssets', function () {
  return gulp.src(['node_modules/font-awesome/fonts/**/*'])
    .pipe(gulp.dest(paths.tmp + '/fonts'));
});

gulp.task('copy', ['html', 'css', 'js', 'vendorCSS', 'vendorJS', 'vendorAssets']);

gulp.task('inject', ['copy'], function () {
  return gulp.src(paths.tmpHTML)
    .pipe(inject(gulp.src([paths.tmpCSS, paths.tmpJS], {read: false}), { relative:true }))
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('serve', ['inject'], function() {
  browserSync.init({
    server: {
      baseDir: paths.tmp
    }
  });
});

gulp.task('reload', ['inject'], function (done) {
  browserSync.reload();
  done();
});

gulp.task('watch', ['serve'], function () {
  gulp.watch(paths.src, ['reload']);
});