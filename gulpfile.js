const gulp = require('gulp');

const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const del = require('del');
const postcss = require('gulp-postcss');

const metalsmith = require('./index');

function swallowError(error) {
  console.log(error.toString());

  this.emit('end');
}

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
    .src('./src/styles/main.css')
    .pipe(postcss())
    .on('error', swallowError)
    .pipe(gulp.dest('./public/css/'))
    .on('end', () => browserSync.reload());
});

gulp.task('css:watch', () => {
  gulp.watch('./src/styles/**/*.css', ['css']);
});

gulp.task('default', () => {
  runSequence(['metalsmith', 'css'], 'browserSync', ['css:watch', 'metalsmith:watch']);
});
