var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var del = require('del');
var eslint = require('gulp-eslint');
var merge = require('merge-stream');
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
  distJS: 'dist/**/*.js',
  distJSFolder: 'dist/js'
};

gulp.task('default', function () {
  console.log('Hello World!');
});

gulp.task('cleanJS', function() {
  del([paths.demoJSFolder + '/*orgchart*', paths.distJSFolder]);
});

gulp.task('eslint', function () {
  return gulp.src(paths.srcJS)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('test', ['eslint'], function () {
  return gulp.src(['test/**/*-tests.js'], {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('js', ['cleanJS', 'test'], function () {
  return gulp.src(paths.srcJS)
    .pipe(uglify())
    .pipe(rename('jquery.orgchart.min.js'))
    .pipe(gulp.dest(paths.demoJSFolder))
    .pipe(gulp.dest(paths.distJSFolder));
});

gulp.task('css', function () {
  return gulp.src(paths.srcCSS)
    .pipe(gulp.dest(paths.demo))
    .pipe(gulp.dest(paths.dist));
});

gulp.task('vendorAssets', function() {
  var fontawesomeCSS = gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest(paths.demoCSSFolder));

  var fontawesomeFonts = gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest(paths.demo + '/fonts'));

  var vendorJS = gulp.src([
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/jquery-mockjax/dist/jquery.mockjax.min.js',
      'node_modules/html2canvas/dist/html2canvas.min.js'
    ])
    .pipe(gulp.dest(paths.demoJSFolder));

  return merge(fontawesomeCSS, fontawesomeFonts, vendorJS);
});

gulp.task('build', ['js', 'css', 'vendorAssets']);

gulp.task('reload', function (done) {
  browserSync.reload();
  done();
});

gulp.task('serve', ['build'], function() {
  browserSync.init({
    server: {
      baseDir: paths.demo
    }
  });
  gulp.watch(paths.srcFiles, ['build']);
  gulp.watch(paths.demoFiles, ['reload']);
});