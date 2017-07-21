const gulp = require('gulp');

const browserSync = require('browser-sync');
const runSequence = require('run-sequence');
const del = require('del');
const postcss = require('gulp-postcss');

const metalsmith = require('./index');

const watchify = require('watchify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

/**
 * Javascript
 */

gulp.task('js', () => {
  const customOpts = {
    cache: {},
    debug: true,
    entries: './src/js/main.js',
    transform: [['babelify', { presets: ['es2015'] }]],
  };
  const appBundle = browserify(customOpts);
  appBundle.plugin(watchify);

  const buildApp = function() {
    return appBundle
      .bundle()
      .on('error', console.log)
      .pipe(source('main.js'))
      .pipe(buffer())
      .on('error', console.log)
      .pipe(gulp.dest('./public/js/'))
      .pipe(browserSync.stream());
  };

  appBundle.on('update', buildApp);

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

function swallowError(error) {
  console.log(error.toString());

  this.emit('end');
}
