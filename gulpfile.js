var gulp = require('gulp');
var $    = require('gulp-load-plugins')();
var browserSync = require('browser-sync').create();

var sassPaths = [
  'bower_components/normalize.scss/sass',
  'bower_components/foundation-sites/scss',
  'bower_components/motion-ui/src'
];

gulp.task('sass', function() {
  return gulp.src('scss/embl-design-language-framework.scss')
    .pipe($.sass({
      includePaths: sassPaths,
      outputStyle: 'compressed' // if css compressed **file size**
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: ['last 2 versions', 'ie >= 9']
    }))
    .pipe(gulp.dest('css'));
});


gulp.task('browser-sync', function() {
  browserSync.init({
    // proxy: "yourlocal.dev"
    server: {
      baseDir: './'
    }
  },function(){
    // something you want to do
  });
});


gulp.task('dev', ['browser-sync'], function() {
  var watcher = gulp.watch(['index.html'], function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    setTimeout(function() {
      browserSync.reload();
    }, 500); // wait for the filesystem to write
  });
});

gulp.task('default', ['sass','dev'], function() {
  gulp.watch(['scss/**/*.scss'], ['sass']);
});
