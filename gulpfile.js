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
var testcafe = require('gulp-testcafe');
var paths = {
  src: 'src',
  srcFiles: 'src/**/*',
  srcHTML: 'src/**/*.html',
  srcCSS: 'src/css/*.css',
  srcJS: 'src/js/*.js',
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

gulp.task('unit-tests', function () {
  return gulp.src(['test/unit/*.js'], {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('integration-tests', ['unit-tests'], function () {
  return gulp.src(['test/integration/*.js'], {read: false})
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('addAssets', ['integration-tests'], function () {
  var fontawesomeCSS = gulp.src('node_modules/font-awesome/css/font-awesome.min.css')
    .pipe(gulp.dest(paths.demoCSSFolder));

  var fontawesomeFonts = gulp.src('node_modules/font-awesome/fonts/*')
    .pipe(gulp.dest(paths.demo + '/fonts'));

  var jsFiles = gulp.src([
      paths.srcJS,
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/jquery-mockjax/dist/jquery.mockjax.min.js',
      'node_modules/html2canvas/dist/html2canvas.min.js',
      'node_modules/jspdf/dist/jspdf.min.js'
    ])
    .pipe(gulp.dest(paths.demoJSFolder));

  var cssFiles = gulp.src(paths.srcCSS)
    .pipe(gulp.dest(paths.demoCSSFolder));

  return merge(fontawesomeCSS, fontawesomeFonts, jsFiles, cssFiles);
});

gulp.task('e2e-tests', ['addAssets'], function () {
  return gulp.src('test/e2e/**/test.js')
    .pipe(testcafe({ browsers: ['chrome:headless', 'firefox:headless'] }));
});

gulp.task('cleanupJS', function() {
  del([paths.distJSFolder + '/**']);
});

gulp.task('eslint', function () {
  return gulp.src(paths.srcJS)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('js', ['cleanupJS', 'eslint', 'e2e-tests'], function () {
  return gulp.src(paths.srcJS)
    .pipe(gulp.dest(paths.distJSFolder))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename('jquery.orgchart.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.distJSFolder));
});

gulp.task('cleanupCSS', function() {
  del([paths.distCSSFolder + '/**']);
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
    .pipe(gulp.dest(paths.distCSSFolder))
    .pipe(cleanCSS())
    .pipe(rename('jquery.orgchart.min.css'))
    .pipe(gulp.dest(paths.distCSSFolder));
});

gulp.task('build', ['js', 'css']);

gulp.task('reload', function (done) {
  browserSync.reload();
  done();
});

gulp.task('serve', ['build'], function () {
  browserSync.init({
    server: {
      baseDir: paths.demo
    }
  });
  gulp.watch(paths.srcFiles, ['build']);
  gulp.watch(paths.demoFiles, ['reload']);
});