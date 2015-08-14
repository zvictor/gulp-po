(function() {
  var PLUGIN_NAME, POEditor, PluginError, gulpPo, gutil, through;

  through = require('through2');

  gutil = require('gulp-util');

  PluginError = gutil.PluginError;

  POEditor = require('./POEditor');

  PLUGIN_NAME = 'gulp-po';

  gulpPo = function(action, options) {
    var allowedActions, files, onEnd, onFile;
    if (!action) {
      throw new PluginError(PLUGIN_NAME, "Missing parameter action.");
    }
    files = [];
    allowedActions = ['push', 'pull', 'sync'];
    if (!(allowedActions.indexOf(action) > -1)) {
      throw new PluginError(PLUGIN_NAME, "Action '" + action + "' is not allowed.");
    }
    onFile = function(file, enc, callback) {
      files.push(file);
      callback();
    };
    onEnd = function(callback) {
      switch (action) {
        case 'push':
          POEditor.push(files, options, (function(_this) {
            return function(err, data) {
              var details, file, i, j, lang, len, len1;
              if (err) {
                callback(err);
                return;
              }
              for (i = 0, len = data.length; i < len; i++) {
                lang = data[i];
                details = lang.details;
                gutil.log("[" + lang.lang + "] Parsed: " + details.parsed + ", Added: " + details.added + ", Updated: " + details.updated);
              }
              for (j = 0, len1 = files.length; j < len1; j++) {
                file = files[j];
                _this.push(file);
              }
              return callback();
            };
          })(this));
          break;
        case 'pull':
          POEditor.pull(files, options, (function(_this) {
            return function(err, data) {
              var file, i, j, lang, len, len1, ref;
              if (err) {
                callback(err);
                return;
              }
              for (i = 0, len = data.length; i < len; i++) {
                lang = data[i];
                gutil.log("[" + lang.lang + "] Added terms: " + lang.added + ", Modified strings: " + lang.modified);
                ref = lang.mergedFiles;
                for (j = 0, len1 = ref.length; j < len1; j++) {
                  file = ref[j];
                  _this.push(file);
                }
              }
              return callback();
            };
          })(this));
          break;
        case 'sync':
          POEditor.sync(files, options, (function(_this) {
            return function(err, data) {
              var file, i, len;
              if (err) {
                callback(err);
                return;
              }
              gutil.log("Parsed: " + data.parsed + ", Added: " + data.added + ", Updated: " + data.updated);
              for (i = 0, len = files.length; i < len; i++) {
                file = files[i];
                _this.push(file);
              }
              return callback();
            };
          })(this));
      }
    };
    return through.obj(onFile, onEnd);
  };

  module.exports = gulpPo;

}).call(this);
