var debug = require("gulp-debug");
var del = require("del");
var flatten = require("gulp-flatten");
var gulp = require('gulp');
var karma = require("karma");
var runSequence = require('run-sequence');
var typescript = require('gulp-typescript');
var tslint = require("gulp-tslint");

gulp.task("default", function (done) {
	runSequence(
		"clean", "validate", "build",
		function () {
			done();
		})
});

/**
 * Clean build results.
 */
gulp.task("clean", function () {
	return del("dist");
});

/**
 * Validate sources.
 */
gulp.task("validate", function (done) {
	runSequence(
		"tslint", "test",
		function () {
			done();
		})
});

/*
 * Compile.
 */
gulp.task("build", function () {
	var project = typescript.createProject("tsconfig.json");
	var result = project
		.src()
		.pipe(debug({ title: "typescript" }))
		.pipe(project(typescript.reporter.longReporter()));
	result.js
		.pipe(flatten())
		.pipe(debug({ title: "js" }))
		.pipe(gulp.dest("dist"));
	result.dts
		.pipe(flatten())
		.pipe(debug({ title: "dts" }))
		.pipe(gulp.dest("dist"));
});

/**
 * Perform tslint check.
 */
gulp.task("tslint", function () {
	return gulp
		.src([
			"src/**/*.ts"
		])
		.pipe(debug({ title: "tslint" }))
		.pipe(tslint())
		.pipe(tslint.report());
});

/**
 * Patch karma static files (see http://lathonez.github.io/2016/ionic-2-unit-testing/).
 */
gulp.task("patch-karma-static", function () {
	return gulp
		.src(["test/karma-static/*"])
		.pipe(gulp.dest("node_modules/karma/static"));
});

/**
 * Perform unit tests.
 * taken from http://lathonez.github.io/2016/ionic-2-unit-testing/
 */
gulp.task("test", function (done) {
	new karma.Server(
		{
			configFile: process.cwd() + "/test/karma.config.js",
			singleRun: true
		},
		done).start();
});

/**
 * Run unit tests in Chrome for debugging.
 * Copy before C:\Tools\PortableApps\PortableApps\GoogleChromePortable\App\Chrome-bin to %LOCALAPPDATA%\Google\Chrome\Application.
 */
gulp.task("test-chrome", function (done) {
	new karma.Server(
		{
			configFile: process.cwd() + "/test/karma.config.js",
			singleRun: false,
			browsers: ["Chrome"]
		},
		done).start();
});
