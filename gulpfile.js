const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const minimist = require('minimist');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnext = require('postcss-preset-env');
const mqpacker = require('css-mqpacker');
const sortCSSmq = require('sort-css-media-queries');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const cache = require('gulp-cache');
const gulpIf = require('gulp-if');
const extend = require('extend');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');

// Configuration
//
var config = extend(
  {
    env: process.env.NODE_ENV,
  },
  minimist(process.argv.slice(2)),
);

// Getters / Setters
//
gulp.task('set-dev-node-env', function (done) {
  process.env.NODE_ENV = config.env = 'development';
  done();
});
gulp.task('set-prod-node-env', function (done) {
  process.env.NODE_ENV = config.env = 'production';
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

  // const tasks = folders.map(function (element) {
  return gulp
    .src('scss/!(_)*.scss', {
      base: 'scss',
    })
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
    .pipe(gulp.dest('css'))
    .pipe(browserSync.stream());
  // };
  // return merge(tasks);
});

gulp.task('uglify', function () {
  return gulp
    .src('js/main.js')
    .pipe(
      plumber(function (error) {
        console.log('uglify:', error.message);
        this.emit('end');
      }),
    )
    .pipe(gulpIf(config.env === 'development', sourcemaps.init()))
    .pipe(gulpIf(config.env === 'production', uglify()))
    .on('error', swallowError)
    .pipe(gulpIf(config.env === 'development', sourcemaps.write()))
    .pipe(plumber.stop())
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(gulp.dest('js'))
    .on('end', function () {
      browserSync.reload();
    });
});

gulp.task('img', function () {
  return gulp
    .src('images/raw/**/*.{jpg,png,svg}')
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
    .pipe(
      rename({
        suffix: '.min',
      }),
    )
    .pipe(gulp.dest('images/compressed/'))
    .on('end', function () {
      browserSync.reload();
    });
});

gulp.task('watch', function () {
  gulp.watch('js/main.js', gulp.series('uglify'));
  gulp.watch('images/raw/**/*.{jpg,png,svg}', gulp.series('img'));
  gulp.watch('scss/*.scss', gulp.series('sass'));

  browserSync.init({
    server: {
      baseDir: './',
    },
  });
  browserSync.watch(['./*.html']).on('change', browserSync.reload);
});

gulp.task('default', gulp.series('set-dev-node-env', gulp.parallel('uglify', 'sass'), 'watch'));

gulp.task('build', gulp.series(gulp.parallel('set-prod-node-env', 'uglify', 'sass')));

console.log('env:', config.env);

function swallowError(error) {
  console.log(error.toString());
  this.emit('end');
}
