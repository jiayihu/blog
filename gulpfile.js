const gulp = require("gulp");
const gulpIf = require("gulp-if");
const browserSync = require("browser-sync");
const del = require("del");

const postcss = require("gulp-postcss");
const cleanCSS = require("gulp-clean-css");
const critical = require("critical").stream;

const metalsmith = require("./index");

const watchify = require("watchify");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const uglify = require("gulp-uglify");

require("dotenv").config();

const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Javascript
 */

gulp.task("js", () => {
  const customOpts = {
    cache: {},
    debug: IS_DEV,
    entries: "./src/js/main.js",
    transform: [
      [
        "babelify",
        {
          presets: ["es2015"],
          plugins: ["transform-inline-environment-variables"],
        },
      ],
    ],
  };
  const appBundle = browserify(customOpts);
  if (IS_DEV) appBundle.plugin(watchify);

  const buildApp = function () {
    return appBundle
      .bundle()
      .on("error", console.log)
      .pipe(source("main.js"))
      .pipe(buffer())
      .on("error", console.log)
      .pipe(gulpIf(!IS_DEV, uglify()))
      .pipe(gulp.dest("./public/js/"))
      .pipe(browserSync.stream());
  };

  if (IS_DEV) appBundle.on("update", buildApp);

  return buildApp();
});

gulp.task("pwa", function () {
  return gulp.src("./src/js/sw.js").pipe(gulp.dest("./public/"));
});

gulp.task("pwa:watch", function (done) {
  gulp.watch(["./src/js/sw.js"], gulp.series("pwa"));
  done();
});

/**
 * Metalsmith
 */

gulp.task("metalsmith", (done) => {
  del.sync(["public/**/*.html"]);
  metalsmith(() => {
    browserSync.reload();
    done();
  });
});

gulp.task("metalsmith:watch", (done) => {
  gulp.watch(
    ["./layouts/**/*.html", "./src/articles/*.md"],
    gulp.series("metalsmith")
  );

  done();
});

/**
 * CSS
 */

gulp.task("css", () => {
  return gulp
    .src("./src/styles/main.css")
    .pipe(postcss())
    .on("error", swallowError)
    .pipe(gulpIf(!IS_DEV, cleanCSS()))
    .pipe(gulp.dest("./public/css/"))
    .pipe(browserSync.stream());
});

gulp.task("critical", function () {
  return gulp
    .src("./public/**/*.html", { base: "./" })
    .pipe(
      critical({
        base: "public/",
        inline: true,
        css: ["public/css/main.css"],
        width: 1280,
        height: 900,
      })
    )
    .on("error", function (err) {
      log.error(err.message);
    })
    .pipe(gulp.dest("./")); // Use the same value of { base } in .src to allow overriding source files
});

gulp.task("css:watch", (done) => {
  gulp.watch("./src/styles/**/*.css", gulp.series("css"));
  done();
});

/**
 * Other
 */

gulp.task("browserSync", (done) => {
  browserSync(
    {
      server: {
        baseDir: "./public",
      },
      watch: true,
      files: "**/*",
      port: 8000,
    },
    () => done()
  );
});

gulp.task("clean", () => {
  return del(["public"]);
});

gulp.task("static", () => {
  return gulp.src("./src/static/**/*").pipe(gulp.dest("./public/"));
});

gulp.task(
  "default",
  gulp.series(
    "clean",
    gulp.parallel("static", "metalsmith", "css", "js", "pwa"),
    "browserSync",
    gulp.parallel("css:watch", "metalsmith:watch", "pwa:watch")
  )
);

gulp.task(
  "build",
  gulp.series(
    "clean",
    gulp.parallel(["static", "metalsmith", "css", "js", "pwa"]),
    "critical"
  )
);

function swallowError(error) {
  console.log(error.toString());

  this.emit("end");
}
