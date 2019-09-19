const gulp = require('gulp');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const tsify = require("tsify");
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const es = require('event-stream');
const glob = require('glob');
const cleanCSS = require('gulp-clean-css');
const minifyHTML = require('gulp-minify-html');
const del = require('del');

function copy(cb) {
    gulp.src('src/*.+(html|js|json)').pipe(gulp.dest("dist"));
    gulp.src('src/+(assets|_locales|vendor)/**', {
            base: 'src'
        })
        .pipe(gulp.dest("dist"));
    cb();
}

function jscompress(cb) {
    gulp.src('dist/assets/*.js', {
            base: 'dist'
        })
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
    cb();
}

function csscompress(cb) {
    gulp.src('dist/**/*.css', {
            base: 'dist'
        })
        .pipe(cleanCSS())
        .pipe(gulp.dest('dist'));
    cb();
}

function htmlcompress(cb) {
    gulp.src('dist/**/*.html', {
            base: 'dist'
        })
        .pipe(minifyHTML())
        .pipe(gulp.dest('dist'));
    cb();
}

function compileTs(done) {
    glob('./src/**.ts', function (err, files) {
        if (err) done(err);

        var tasks = files.map(function (entry) {
            return browserify({
                    entries: [entry]
                })
                .plugin(tsify)
                .bundle()
                .pipe(source(entry.replace('src/', '')))
                .pipe(rename({
                    extname: '.js'
                }))
                /*
                .pipe(gulp.dest('./dist'))
                .pipe(uglify())
                .pipe(rename({
                    extname:'.min.js'
                }))
                */
                .pipe(gulp.dest('./dist'));
        });
        es.merge(tasks).on('end', done);
    })
};

function clean(cb) {
    return del(['dist'], cb);
}

gulp.watch('src/**/*',gulp.series(copy,compileTs));

exports.compress = gulp.series(csscompress, jscompress, htmlcompress);
exports.default = gulp.series(clean, copy, compileTs);