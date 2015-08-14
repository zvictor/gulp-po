(function() {
  var POEditorAPI, POEditorDownloader, POEditorUploader;

  POEditorAPI = require('./POEditorAPI');

  POEditorDownloader = require('./POEditorDownloader');

  POEditorUploader = require('./POEditorUploader');

  module.exports = {
    pull: function(files, options, callback) {
      var poeditorApi;
      poeditorApi = new POEditorAPI(options, (function(_this) {
        return function(err) {
          var poeditorDownloader;
          if (err) {
            callback(err);
            return;
          }
          poeditorDownloader = new POEditorDownloader(poeditorApi, files, function(err, data) {
            if (err) {
              callback(err);
              return;
            }
            callback(null, data);
          });
        };
      })(this));
    },
    sync: function(files, options, callback) {
      var poeditorApi;
      return poeditorApi = new POEditorAPI(options, (function(_this) {
        return function(err) {
          var poeditorUploader;
          if (err) {
            callback(err);
            return;
          }
          poeditorUploader = new POEditorUploader(poeditorApi, files, function(err, data) {
            var details;
            if (err) {
              callback(err);
              return;
            }
            details = data.details;
            callback(null, details);
          });
        };
      })(this));
    },
    push: function(files, options, callback) {
      var poeditorApi;
      return poeditorApi = new POEditorAPI(options, (function(_this) {
        return function(err) {
          var poeditorUploader;
          if (err) {
            callback(err);
            return;
          }
          poeditorUploader = new POEditorUploader(poeditorApi, files, function(err, data) {
            if (err) {
              callback(err);
              return;
            }
            poeditorUploader.uploadTranslates(function(err, data) {
              if (err) {
                callback(err);
                return;
              }
              callback(null, data);
            });
          });
        };
      })(this));
    }
  };

}).call(this);
