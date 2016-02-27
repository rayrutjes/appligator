const gulp = require('gulp');
const jade = require('gulp-jade');
const sass = require('gulp-sass');
const favicons = require("gulp-favicons");
const runSequence = require('run-sequence');
const del = require('del');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const webserver = require('gulp-webserver');
const ghPages = require('gulp-gh-pages');
const prefix = require('gulp-autoprefixer');

gulp.task('clean', function() {
    return del('dist');
});

gulp.task('jade', function() {
    return gulp.src('src/jade/*.jade')
        .pipe(jade())
        .pipe(gulp.dest('dist/'))
});

gulp.task('sass', function () {
    return gulp.src('src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(prefix({
            browsers: ['last 2 versions', '>1%']
        }))
        .pipe(gulp.dest('dist/css/'));
});

gulp.task("favicons", function () {
    return gulp.src("src/favicon.png")
        .pipe(favicons({
            icons: {
                android: false,
                appleIcon: false,
                appleStartup: false,
                coast: false,
                favicons: true,
                firefox: false,
                opengraph: false,
                twitter: false,
                windows: false,
                yandex: false
            }
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task('images', function () {
    return gulp.src('src/img/*')
        .pipe(imagemin({use:[pngquant()]}))
        .pipe(gulp.dest('dist/img'));
});

gulp.task('js', function () {
    return gulp.src('src/js/app.js')
        .pipe(gulp.dest('dist/js'));
});

gulp.task('serve', function() {
    return gulp.src('dist')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true
        }));
});

gulp.task('watch', function () {
    gulp.watch('src/jade/**/*.jade', ['jade']);
    gulp.watch('src/sass/**/*.scss', ['sass']);
    gulp.watch('src/favicon.png', ['favicons']);
    gulp.watch('src/img/*', ['images']);
    gulp.watch('src/js/**/*.js', ['js']);
});

gulp.task('build', function(callback) {
   runSequence('clean', ['jade', 'sass', 'favicons', 'images', 'js'], callback);
});

gulp.task('dev', function(callback) {
    runSequence('build', ['watch', 'serve'], callback);
});

gulp.task('publish',['build'], function(callback) {
    return gulp.src('dist/**/*')
        .pipe(ghPages());
});

