const gulp = require('gulp');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const del = require('del');

const metalsmith = require('./index');

gulp.task('metalsmith', () => {
  del.sync(['public/**/*.html']);
  return metalsmith();
});

gulp.task('metalsmith:watch', () => {
  return gulp.watch('./layouts/**/*.html', ['metalsmith']);
});

gulp.task('browserSync', () => {
  return browserSync({
    files: './public/',
    server: {
      baseDir: './public',
    },
  });
});

gulp.task('sass', () => {
  return gulp
    .src('./src/scss/main.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', () => {
  gulp.watch('./src/scss/**/*.scss', ['sass']);
});

gulp.task('default', () => {
  runSequence(['metalsmith', 'sass'], 'browserSync', ['sass:watch', 'metalsmith:watch']);
});
