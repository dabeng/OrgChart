const gulp = require('gulp');
const { spawn } = require('node:child_process');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const rename = require("gulp-rename");
const eslint = require('gulp-eslint');
const merge = require('ordered-read-streams');
const csslint = require('gulp-csslint');
const cleanCSS = require('gulp-clean-css');
const sourcemaps = require('gulp-sourcemaps');
const cypress = require('cypress');
const jest = require('gulp-jest').default;
const deletePaths = (patterns) => import('del').then(({ deleteAsync }) => deleteAsync(patterns));
const runMocha = (files) => new Promise(function (resolve, reject) {
  const mochaProcess = spawn(process.execPath, [
    require.resolve('mocha/bin/mocha.js'),
    '--reporter', 'spec'
  ].concat(files), { stdio: 'inherit' });

  mochaProcess.once('error', reject);
  mochaProcess.once('exit', function (exitCode) {
    if (exitCode === 0) {
      resolve();
    } else {
      reject(new Error('Tests failed with exit code ' + exitCode));
    }
  });
});
const paths = {
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
  return runMocha(['test/unit/*.js']);
});

gulp.task('integration-tests', gulp.series('unit-tests', function () {
  return runMocha(['test/integration/*.js']);
}));

gulp.task('addAssets', gulp.series('integration-tests', function () {
  const jsFiles = gulp.src([
      paths.srcJS,
      'node_modules/html2canvas/dist/html2canvas.min.js',
      'node_modules/jspdf/dist/jspdf.umd.min.js',
      'node_modules/json-digger/dist/json-digger.js'
    ])
    .pipe(gulp.dest(paths.demoJSFolder));

  const cssFiles = gulp.src(paths.srcCSS)
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
  return deletePaths([paths.distJSFolder + '/**']);
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
    .pipe(rename('orgchart.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.distJSFolder));
}));

gulp.task('cleanupCSS', function() {
  return deletePaths([paths.distCSSFolder + '/**']);
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
    .pipe(rename('orgchart.min.css'))
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