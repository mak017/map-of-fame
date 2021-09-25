/* eslint-disable no-console */
/* eslint-disable func-names */
// const gulp = require("gulp");
import gulp from "gulp";
// const minimist = require("minimist");
import minimist from "minimist";
// const sass = require("gulp-sass");
import dartSass from "sass";
import gulpSass from "gulp-sass";

// const postcss = require("gulp-postcss");
import postcss from "gulp-postcss";
// const cssnext = require("postcss-preset-env");
import cssnext from "postcss-preset-env";
// const mqpacker = require("css-mqpacker");
import mqpacker from "css-mqpacker";
// const sortCSSmq = require("sort-css-media-queries");
import sortCSSmq from "sort-css-media-queries";
// const cleanCSS = require("gulp-clean-css");
import cleanCSS from "gulp-clean-css";
// const debug = require("gulp-debug");
import debug from "gulp-debug";
// const plumber = require("gulp-plumber");
import plumber from "gulp-plumber";
// const sourcemaps = require("gulp-sourcemaps");
import imagemin from "gulp-imagemin";
// const imagemin = require("gulp-imagemin");
// const gulpIf = require("gulp-if");
// const extend = require("extend");
import extend from "extend";
// const imageminJpegRecompress = require("imagemin-jpeg-recompress");
import imageminJpegRecompress from "imagemin-jpeg-recompress";

const sass = gulpSass(dartSass);

// Configuration
//
const config = extend(
  {
    env: process.env.NODE_ENV,
  },
  minimist(process.argv.slice(2))
);

// Getters / Setters
//
gulp.task("set-dev-node-env", function (done) {
  config.env = "development";
  process.env.NODE_ENV = config.env;
  done();
});
gulp.task("set-prod-node-env", function (done) {
  config.env = "production";
  process.env.NODE_ENV = config.env;
  done();
});

gulp.task("sass", function () {
  const processors = [
    cssnext({
      browsers: ["last 2 version", "> 1%"],
    }),
    mqpacker({
      sort: sortCSSmq,
    }),
  ];

  return (
    gulp
      .src("src/scss/!(_)*.scss")
      .pipe(
        plumber(function (error) {
          console.log("sass:", error.message);
          this.emit("end");
        })
      )
      // .pipe(gulpIf(config.env === "development", sourcemaps.init()))
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss(processors))
      .pipe(cleanCSS())
      // .pipe(gulpIf(config.env === "development", sourcemaps.write()))
      .pipe(plumber.stop())
      .pipe(gulp.dest("public"))
  );
});

gulp.task("img", function () {
  return gulp
    .src("src/images/**/*.{jpg,png,svg}")
    .pipe(
      debug({
        title: "img:",
      })
    )
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imageminJpegRecompress({
          loops: 4,
          min: 50,
          max: 95,
          quality: "high",
        }),
        imagemin.optipng({
          optimizationLevel: 5,
        }),
        imagemin.svgo(),
      ])
    )
    .pipe(gulp.dest("public/images/"));
});

gulp.task("watch", function () {
  gulp.watch("src/images/**/*.{jpg,png,svg}", gulp.series("img"));
  gulp.watch("src/scss/**/*.scss", gulp.series("sass"));
});

gulp.task("default", gulp.series("set-dev-node-env", "sass", "watch"));

gulp.task("build", gulp.series(gulp.parallel("set-prod-node-env", "sass")));
