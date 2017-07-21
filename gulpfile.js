const gulp = require('gulp');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const del = require('del');
const postcss = require('gulp-postcss');

const metalsmith = require('./index');

gulp.task('metalsmith', () => {
  del.sync(['public/**/*.html']);
  metalsmith(() => browserSync.reload());
});

gulp.task('metalsmith:watch', () => {
  return gulp.watch(['./layouts/**/*.html', './src/articles/*.md'], ['metalsmith']);
});

gulp.task('browserSync', () => {
  return browserSync({
    server: {
      baseDir: './public',
    },
  });
});

gulp.task('css', () => {
  return gulp
    .src('./styles/main.css')
    .pipe(postcss())
    .pipe(gulp.dest('./public/css/'))
    .on('end', () => browserSync.reload());
});

gulp.task('css:watch', () => {
  gulp.watch('./styles/**/*.css', ['css']);
});

gulp.task('default', () => {
  runSequence(['metalsmith', 'css'], 'browserSync', ['css:watch', 'metalsmith:watch']);
});
