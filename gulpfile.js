const gulp = require('gulp');
const gulpIf = require('gulp-if');
const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const del = require('del');

const postcss = require('gulp-postcss');
const cleanCSS = require('gulp-clean-css');

const metalsmith = require('./index');

const watchify = require('watchify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');

const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Javascript
 */

gulp.task('js', () => {
  const customOpts = {
    cache: {},
    debug: IS_DEV,
    entries: './src/js/main.js',
    transform: [['babelify', { presets: ['es2015'] }]],
  };
  const appBundle = browserify(customOpts);
  if (IS_DEV) appBundle.plugin(watchify);

  const buildApp = function() {
    return appBundle
      .bundle()
      .on('error', console.log)
      .pipe(source('main.js'))
      .pipe(buffer())
      .on('error', console.log)
      .pipe(gulpIf(!IS_DEV, uglify()))
      .pipe(gulp.dest('./public/js/'))
      .pipe(browserSync.stream());
  };

  if (IS_DEV) appBundle.on('update', buildApp);

  return buildApp();
});

/**
 * Metalsmith
 */

gulp.task('metalsmith', () => {
  del.sync(['public/**/*.html']);
  metalsmith(() => browserSync.reload());
});

gulp.task('metalsmith:watch', () => {
  return gulp.watch(['./layouts/**/*.html', './src/articles/*.md'], ['metalsmith']);
});

/**
 * CSS
 */

gulp.task('css', () => {
  return gulp
    .src('./src/styles/main.css')
    .pipe(postcss())
    .on('error', swallowError)
    .pipe(gulpIf(!IS_DEV, cleanCSS()))
    .pipe(gulp.dest('./public/css/'))
    .pipe(browserSync.stream());
});

gulp.task('css:watch', () => {
  gulp.watch('./src/styles/**/*.css', ['css']);
});

/**
 * Other
 */

gulp.task('browserSync', () => {
  return browserSync({
    server: {
      baseDir: './public',
    },
  });
});

gulp.task('clean', () => {
  del.sync(['public']);
});

gulp.task('static', () => {
  return gulp.src('./src/static/**/*').pipe(gulp.dest('./public/'));
});

gulp.task('default', () => {
  runSequence('clean', ['static', 'metalsmith', 'css', 'js'], 'browserSync', [
    'css:watch',
    'metalsmith:watch',
  ]);
});

gulp.task('build', () => {
  runSequence('clean', ['static', 'metalsmith', 'css', 'js']);
});

function swallowError(error) {
  console.log(error.toString());

  this.emit('end');
}
