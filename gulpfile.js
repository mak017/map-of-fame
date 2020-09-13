/* eslint-disable no-console */
/* eslint-disable func-names */
const gulp = require('gulp');
const path = require('path');
const browserSync = require('browser-sync').create();
const minimist = require('minimist');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-preset-env');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const gulpIf = require('gulp-if');
const extend = require('extend');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const webpack = require('webpack');
const webpackConfig = require(path.join(__dirname, '/webpack.config.js'));

// Configuration
//
let config = extend(
  {
    env: process.env.NODE_ENV,
  },
  minimist(process.argv.slice(2)),
);

// Getters / Setters
//
gulp.task('set-dev-node-env', function (done) {
  config.env = 'development';
  process.env.NODE_ENV = config.env;
  done();
});
gulp.task('set-prod-node-env', function (done) {
  config.env = 'production';
  process.env.NODE_ENV = config.env;
  done();
});

gulp.task('sass', function () {
  const processors = [
    cssnext({
      browsers: ['last 2 version', '> 1%'],
    }),
    mqpacker({
      sort: sortCSSmq,
    }),
  ];

  return gulp
    .src('src/scss/!(_)*.scss')
    .pipe(
      plumber(function (error) {
        console.log('sass:', error.message);
        this.emit('end');
      }),
    )
    .pipe(gulpIf(config.env === 'development', sourcemaps.init()))
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(cleanCSS())
    .pipe(gulpIf(config.env === 'development', sourcemaps.write()))
    .pipe(plumber.stop())
    .pipe(gulp.dest('dist/css'))
    .pipe(browserSync.stream());
});

gulp.task('js', function () {
  return new Promise((resolve, reject) => {
    const compiler = webpack(webpackConfig);
    compiler.run((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
        browserSync.reload();
      }
    });
  });
});

gulp.task('img', function () {
  return gulp
    .src('src/images/**/*.{jpg,png,svg}')
    .pipe(
      debug({
        title: 'img:',
      }),
    )
    .pipe(
      imagemin([
        imagemin.gifsicle(),
        imageminJpegRecompress({
          loops: 4,
          min: 50,
          max: 95,
          quality: 'high',
        }),
        imagemin.optipng({
          optimizationLevel: 5,
        }),
        imagemin.svgo(),
      ]),
    )
    .pipe(gulp.dest('dist/images/'))
    .on('end', function () {
      browserSync.reload();
    });
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.js', gulp.series('js'));
  gulp.watch('src/images/**/*.{jpg,png,svg}', gulp.series('img'));
  gulp.watch('src/scss/**/*.scss', gulp.series('sass'));

  browserSync.init({
    server: {
      baseDir: './',
    },
  });
  browserSync.watch(['./*.html']).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('set-dev-node-env', gulp.parallel('js', 'sass'), 'watch'));

gulp.task('build', gulp.series(gulp.parallel('set-prod-node-env', 'js', 'sass')));

console.log('env:', config.env);
