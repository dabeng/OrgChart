const gulp = require('gulp');
const mocha = require('gulp-mocha');

gulp.task('default', () => {
  gulp.src(['test/**/*-tests.js'], {read: false})
    .pipe(mocha({reporter: 'spec'}));
});