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
var cypress = require('cypress');
var jest = require('gulp-jest').default;
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

gulp.task('integration-tests', gulp.series('unit-tests', function () {
  return gulp.src(['test/integration/*.js'], {read: false})
    .pipe(mocha({reporter: 'spec'}));
}));

gulp.task('addAssets', gulp.series('integration-tests', function () {
  var jsFiles = gulp.src([
      paths.srcJS,
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/jquery-mockjax/dist/jquery.mockjax.min.js',
      'node_modules/html2canvas/dist/html2canvas.min.js',
      'node_modules/jspdf/dist/jspdf.umd.min.js',
      'node_modules/json-digger/dist/json-digger.js'
    ])
    .pipe(gulp.dest(paths.demoJSFolder));

  var cssFiles = gulp.src(paths.srcCSS)
    .pipe(gulp.dest(paths.demoCSSFolder));

  return merge(jsFiles, cssFiles);
}));

gulp.task('visual-regression', function () {
  return gulp.src('test').pipe(jest({
    "testMatch": ['**/test/visual-regression/**/test.js']
  }));
});

gulp.task('e2e-tests', gulp.series('addAssets', function () {
  return cypress.run({
    spec: 'test/cypress/e2e/**/*.cy.js',
  });
}));

gulp.task('test', gulp.series('e2e-tests'));

gulp.task('cleanupJS', function() {
  return del([paths.distJSFolder + '/**']);
});

gulp.task('eslint', function () {
  return gulp.src(paths.srcJS)
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('js', gulp.series('cleanupJS', 'eslint', 'test', function () {
  return gulp.src(paths.srcJS)
    .pipe(gulp.dest(paths.distJSFolder))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(rename('jquery.orgchart.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.distJSFolder));
}));

gulp.task('cleanupCSS', function() {
  return del([paths.distCSSFolder + '/**']);
});

gulp.task('csslint', function() {
  return gulp.src(paths.srcCSS)
    .pipe(csslint({
      'adjoining-classes': false,
      'box-sizing': false,
      'box-model': false,
      'fallback-colors': false,
      'order-alphabetical': false
    }))
    .pipe(csslint.formatter());
});

gulp.task('css', gulp.series('cleanupCSS', 'csslint', function () {
  return gulp.src(paths.srcCSS)
    .pipe(gulp.dest(paths.distCSSFolder))
    .pipe(cleanCSS())
    .pipe(rename('jquery.orgchart.min.css'))
    .pipe(gulp.dest(paths.distCSSFolder));
}));

gulp.task('build', gulp.series('js', 'css'));

gulp.task('reload', function (done) {
  browserSync.reload();
  done();
});

gulp.task('serve', gulp.series('build', function () {
  browserSync.init({
    server: {
      baseDir: paths.demo
    }
  });
  gulp.watch(paths.srcFiles, gulp.series('build'));
  gulp.watch(paths.demoFiles, gulp.series('reload'));
}));