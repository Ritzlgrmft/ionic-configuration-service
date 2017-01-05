var del = require("del");
var gulp = require('gulp');

/**
 * Clean build results.
 */
gulp.task("clean", function () {
	return del(["dist", "src/*.js", "src/*.map", "src/*.d.ts"]);
});

/**
 * Prepare release by copying the needed files to dist folder.
 */
gulp.task("prepare-release", function () {
	return gulp
		.src(["src/*.js", "src/*.d.ts", "!src/*.spec.*",])
		.pipe(gulp.dest("dist"));
});
