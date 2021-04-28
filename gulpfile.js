var gulp = require("gulp");
var browserSync = require("browser-sync");
var reload = browserSync.reload;
var sass = require("gulp-sass");
var runSequence = require("run-sequence");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");
var autoprefixer = require("gulp-autoprefixer");
var wait = require("gulp-wait");
var notify = require("gulp-notify");
var svgSprite = require("gulp-svg-sprite");

const AUTOPREFIXER_BROWSERS = [
  "last 2 version",
  "> 1%",
  "ie >= 9",
  "ie_mob >= 10",
  "ff >= 30",
  "chrome >= 34",
  "safari >= 7",
  "opera >= 23",
  "ios >= 7",
  "android >= 4",
  "bb >= 10",
];

gulp.task("serve", [], function () {
  browserSync({
    notify: false,
    server: {
      directory: true,
      baseDir: ".",
    },
  });
});

gulp.task("sass", function () {
  return gulp
    .src("css/*.scss")
    .pipe(sourcemaps.init())
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(wait(500))
    .pipe(
      sass({
        outputStyle: "compressed",
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(sourcemaps.write("maps"))
    .pipe(gulp.dest("css"))
    .pipe(
      browserSync.reload({
        stream: true,
      })
    );
});

// SVG Combine
gulp.task("svg-combine", function () {
  return gulp
    .src("_src/iconfont/svg/*.svg")
    .pipe(
      plumber({
        errorHandler: notify.onError("Error: <%= error.message %>"),
      })
    )
    .pipe(
      svgmin({
        plugins: [
          {
            removeDoctype: false,
          },
          {
            removeAttrs: {
              attrs: "fill",
            },
          },
          {
            removeComments: false,
          },
          {
            cleanupNumericValues: {
              floatPrecision: 2,
            },
          },
          {
            convertColors: {
              names2hex: false,
              rgb2hex: false,
            },
          },
        ],
      })
    )
    .pipe(
      svgSprite({
        mode: {
          symbol: {
            // symbol mode to build the SVG
            render: {
              css: false, // CSS output option for icon sizing
              scss: false, // SCSS output option for icon sizing
            },
            dest: "./images", // destination folder
            dimensions: "-svg",
            prefix: " ", // BEM-style prefix if styles rendered
            sprite: "sprite.svg", //generated sprite name
            example: true, // Build a sample page, please!
          },
        },
      })
    )
    .pipe(gulp.dest("."));
});
// SVG font
gulp.task("svg-iconfont", function () {
  return (
    gulp
      .src("./_src/iconfont/svg/*.svg")
      .pipe(
        changed("./css/fonts/iconfont", {
          hasChanged: changed.compareContents,
        })
      )
      .pipe(newer("./css/fonts/iconfont"))
      // .pipe(debug({ title: "unicorn:" }))
      .pipe(
        iconfont({
          fontName: "iconfont",
          formats: ["ttf", "eot", "woff", "woff2"],
          appendCodepoints: true,
          appendUnicode: false,
          normalize: true,
          fontHeight: 1000,
          centerHorizontally: true,
        })
      )
      .on("glyphs", function (glyphs, options) {
        gulp
          .src("_src/iconfont/iconfont.css")
          .pipe(
            consolidate("underscore", {
              glyphs: glyphs,
              fontName: options.fontName,
              fontDate: new Date().getTime(),
            })
          )
          .pipe(gulp.dest("css/fonts/iconfont"));

        gulp
          .src("_src/iconfont/index.html")
          .pipe(
            consolidate("underscore", {
              glyphs: glyphs,
              fontName: options.fontName,
            })
          )
          .pipe(gulp.dest("css/fonts/iconfont"));
      })
      .pipe(gulp.dest("./css/fonts/iconfont"))
  );
});

gulp.task("svg", ["svg-combine", "svg-iconfont"], function (done) {
  gulp
    .src("css/fonts/iconfont/iconfont.css")
    .pipe(rename("_iconfont.scss"))
    .pipe(gulp.dest("css/fonts/iconfont/"));
  browserSync.reload();
  done();
});

// Watchers
gulp.task("watch", function () {
  gulp.watch("css/*.scss", ["sass"]);
  gulp.watch("*.html", browserSync.reload);
  gulp.watch("*.js", browserSync.reload);
  gulp.watch(["_app/iconfont/svg/*.svg"], ["svg"]);
});

// Build Sequences
// ---------------

gulp.task("default", function (callback) {
  runSequence(["sass", "serve"], "watch", callback);
});
