let browserify = require('browserify');
let buffer = require('vinyl-buffer');
let gulp = require('gulp');
let sass = require('gulp-sass');
sass.compiler = require('node-sass');
let source = require('vinyl-source-stream');
let tsify = require('tsify');
let watchify = require('watchify');

let browserSync = require('browser-sync').create();

let OUT_DIR = "out/";
let BROWSERIFY_ENTRIES = ['./src/example.ts']
let BROWSERIFY_OUTPUT_FILE = 'bundle.js'
let SASS_ENTRIES = ['./src/**/*.scss']

gulp.task('browsersync', function() {
  browserSync.init({
    server: {
      baseDir: OUT_DIR
    }
  });

  gulp.watch(['out/**/*']).on('change', browserSync.reload);
});

gulp.task('sass', function () {
  return gulp.src(SASS_ENTRIES)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(OUT_DIR));
});

gulp.task('sass-watch', function() {
  gulp.watch('src/**/*.scss', gulp.parallel('sass'));
});

var opts = Object.assign({}, watchify.args, {
  entries: BROWSERIFY_ENTRIES,
  debug: true
});
var b = browserify(opts);

function runBrowserify() {
  return b
    .plugin(tsify, { noImplicitAny: true })
    .bundle()
    .on('error', function (error) { console.error(error.toString()); })
    .pipe(source(BROWSERIFY_OUTPUT_FILE))
    .pipe(buffer())
    .pipe(gulp.dest(OUT_DIR));
}

gulp.task('ts', function (done) {
  runBrowserify().on('finish', done);
});

gulp.task('ts-watch', function() {
  b = watchify(b)
    .on('update', runBrowserify) // on any dep update, runs the bundler
    .on('log', function (msg) {console.log(msg)});
  runBrowserify();
})

gulp.task('watch', gulp.parallel('browsersync', 'sass', 'sass-watch', 'ts-watch'));

gulp.task('default', gulp.parallel('watch'));
