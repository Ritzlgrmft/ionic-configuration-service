# Common.ConfigurationService

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This service encapsulates configuration functionalities.

In general, the configuration data in stored in the JavaScript variable `window.__configuration`.
This variable is defined in the file `www/build/js/env.js`. 
The source for this file should be stored in a directory called `env`. 
During the build, the environment sources are copied to the `www/js/build` directory.

## Using configuration

Each component should have its own section in the configuration object.
The structure should be defined in an own interface, e.g.

    export interface LoggingConfiguration {
      logLevels?: {
        loggerName: string;
        logLevel: string;
      }[];
	  ...
	}

Now you can inject the `ConfigurationService` into your app and consume the configuration:

    constructor(
      private configurationService: ConfigurationService) {
    
      let configuration = <LoggingConfiguration>this.configurationService.getValue("logging");
      if (!configuration) {
        throw "no configuration provided";
      }

      if (configuration.logLevels) {
        ...
	    }
    }

## Defining configuration

Add a new file called `env/default.js` to your application. This file contains your default configuration.
It defines the object `window.__configuration`, which has for each configured component an own property, e.g.:

    (function (window) {
      window.__configuration = window.__configuration || {};

      window.__configuration.logging = {
        "logLevels": [
          {
            "loggerName": "root",
            "logLevel": "DEBUG"
          }
        ]
      };

      window.__configuration.beaconRegions = ...;

    } (this));

## Environizing configuration

As the name of the file above suggests, it contains a default configuration.
Some of the properties you want to overwrite in specific environments.
Maybe you want to add a file `env/release.js`, containing the release configuration:

    (function (window) {
       window.__configuration.logging = {
        "logLevels": [
          {
            "loggerName": "root",
            "logLevel": "ERROR"
          }
        ]
      };

    } (this));

The configuration above sets the root logger's level to `ERROR` instead of `DEBUG`.

## Building configuration

All needed configuration files from `env` directory should be combined into one
file `www/build/js/env.js`. This file, you should include into `www/index.htm`,
just before the `appBundle.js`:

    <script src="build/js/env.js"></script>
    <script src="build/js/app.bundle.js"></script>

For the `env.js`, you should add a separate `gulp` task:

    gulp.task('env', function () {
      var srcFiles = ["env/default.js"];
      var envIndex = argv.indexOf("--env");
      var hostName = require("os").hostname();
      if (isRelease) {
        srcFiles.push("env/release.js");
      } else if (envIndex >= 0 && envIndex < argv.length - 1) {
        srcFiles.push("env/" + argv[envIndex + 1] + ".js");
      } else {
        srcFiles.push("env/" + hostName + ".js");
      }
      return gulp
        .src(srcFiles)
        .pipe(concat("env.js"))
        .pipe(gulpif(isRelease, uglify()))
        .pipe(gulp.dest("www/build/js"));
      });

This task concats the files:

- `env/default.js`
- `env/release.js` (only if release build)
- `env/ENVIRONMENT.js` (if argument `--env ENVIRONMENT` is specified)
- `env/HOSTNAME.js` (else)

The file gets minified only in the release configuration.

**Attention**: on a Mac, it could be that you have to set the host name before.
You can check the host name with

    scutil --get HostName

If you want to change or set it, just use

    sudo scutil --set HostName ...

## Methods

### getValue(key: string): any

Get the configuration data for the given key.
