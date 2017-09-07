var gulp = require('gulp');
var inject = require('gulp-inject');
var browserSync = require('browser-sync').create();
var mocha = require('gulp-mocha');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var del = require('del');
var eslint = require('gulp-eslint');
var paths = {
  src: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcCSS: 'src/**/*.css',
  srcJS: 'src/**/*.js',
  demo: 'demo',
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

gulp.task('html', function () {
  return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.demo));
});

gulp.task('css', function () {
  return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.demo));
});

gulp.task('vendorCSS', function () {
  return gulp.src(['node_modules/font-awesome/css/font-awesome.min.css'])
    .pipe(gulp.dest(paths.demoCSSFolder));
});

gulp.task('js', function () {
  return gulp.src(paths.srcJS).pipe(gulp.dest(paths.demo));
});

gulp.task('vendorJS', function () {
  return gulp.src(['node_modules/jquery/dist/jquery.min.js', 'node_modules/jquery-mockjax/dist/jquery.mockjax.min.js'])
    .pipe(gulp.dest(paths.demoJSFolder));
});

gulp.task('vendorAssets', function () {
  return gulp.src(['node_modules/font-awesome/fonts/**/*'])
    .pipe(gulp.dest(paths.demo + '/fonts'));
});

gulp.task('copy', ['html', 'css', 'js', 'vendorCSS', 'vendorJS', 'vendorAssets']);

gulp.task('inject', ['copy'], function () {
  return gulp.src(paths.demoHTML)
    .pipe(inject(gulp.src([paths.demoCSS, paths.demoJS], {read: false}), { relative:true }))
    .pipe(gulp.dest(paths.demo));
});

gulp.task('serve', ['inject'], function() {
  browserSync.init({
    server: {
      baseDir: paths.demo
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

gulp.task('cleanJS', function() {
  return del(paths.distJSFolder);
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

gulp.task('distJS', ['cleanJS', 'test'], function () {
  return gulp.src(paths.srcJS)
    .pipe(uglify())
    .pipe(rename('jquery.orgchart.min.js'))
    .pipe(gulp.dest(paths.distJSFolder));
});

gulp.task('build', ['distJS']);