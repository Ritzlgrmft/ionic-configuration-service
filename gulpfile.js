var del = require("del");
var gulp = require('gulp');

/**
 * Clean build results.
 */
gulp.task("clean", function () {
	return del(["dist", "src/*.js", "src/*.map", "src/*.d.ts"]);
});
