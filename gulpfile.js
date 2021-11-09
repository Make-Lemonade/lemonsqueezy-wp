const gulp = require("gulp");
const zip = require("gulp-zip");

function bundle() {
    return gulp
        .src([
            "**/*",
            "!node_modules/**",
            "!bundled/**",
            "!gulpfile.js",
            "!package.json",
            "!package-lock.json",
            "!webpack.config.js",
            "!phpcs.xml",
            "!yarn.lock"
        ])
        .pipe(zip("lemonsqueezy.zip"))
        .pipe(gulp.dest("bundled"));
}

exports.bundle = bundle;
