var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var del = require('del');
var eslint = require('gulp-eslint');
var merge = require('merge-stream');
var csslint = require('gulp-csslint');
var cleanCSS = require('gulp-clean-css');
var sourcemaps = require('gulp-sourcemaps');
var paths = {
  src: 'src',
  srcFiles: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcCSS: 'src/**/*.css',
  srcJS: 'src/**/*.js',
  demo: 'demo',
  demoFiles: 'demo/**/*',
  demoHTML: 'demo/**/*.html',
  demoCSSFolder: 'demo/css',
  demoCSS: 'demo/**/*.css',
  demoJSFolder: 'demo/js',
  demoJS: 'demo/**/*.js',
  dist: 'dist',
  distIndex: 'dist/index.html',
  distCSS: 'dist/**/*.css',
  distCSSFolder: 'dist/css',
  distJS: 'dist/**/*.js',
  distJSFolder: 'dist/js'
};

gulp.task('cleanupJS', function() {
  del([paths.demoJSFolder + '/*orgchart*', paths.distJSFolder]);
});

gulp.task('eslint', function () {
  return gulp.src(paths.srcJS)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('test', function () {
  return gulp.src(['test/**/*-tests.js'], {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('js', ['cleanupJS', 'eslint', 'test'], function () {
  return gulp.src(paths.srcJS)
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename('jquery.orgchart.min.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.demoJSFolder))
    .pipe(gulp.dest(paths.distJSFolder));
});

gulp.task('cleanupCSS', function() {
  del([paths.demoCSSFolder + '/*orgchart*', paths.distCSSFolder]);
});

gulp.task('csslint', function() {
  gulp.src(paths.srcCSS)
    .pipe(csslint({
      'adjoining-classes': false,
      'box-sizing': false,
      'box-model': false,
      'fallback-colors': false,
      'order-alphabetical': false
    }))
    .pipe(csslint.formatter());
});

gulp.task('css', ['cleanupCSS', 'csslint'], function () {
  return gulp.src(paths.srcCSS)
    .pipe(sourcemaps.init())
    .pipe(cleanCSS())
    .pipe(rename('jquery.orgchart.min.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.demoCSSFolder))
    .pipe(gulp.dest(paths.distCSSFolder));
});

gulp.task('vendorAssets', function() {
  var fontawesomeCSS = gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest(paths.demoCSSFolder));

  var fontawesomeFonts = gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest(paths.demo + '/fonts'));

  var vendorJS = gulp.src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/jquery-mockjax/dist/jquery.mockjax.min.js',
      'node_modules/html2canvas/dist/html2canvas.min.js',
      'node_modules/jspdf/dist/jspdf.min.js'
    ])
    .pipe(gulp.dest(paths.demoJSFolder));

  return merge(fontawesomeCSS, fontawesomeFonts, vendorJS);
});

gulp.task('build', ['js', 'css']);

gulp.task('reload', function (done) {
  browserSync.reload();
  done();
});

gulp.task('serve', ['build', 'vendorAssets'], function() {
  browserSync.init({
    server: {
      baseDir: paths.demo
    }
  });
  gulp.watch(paths.srcFiles, ['build']);
  gulp.watch(paths.demoFiles, ['reload']);
});