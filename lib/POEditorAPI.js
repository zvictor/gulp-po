(function() {
  var POEditorAPI, _, request;

  request = require('request');

  _ = require('lodash');

  POEditorAPI = (function() {
    POEditorAPI.prototype.host = 'https://poeditor.com/api/';

    POEditorAPI.prototype.apiToken = null;

    POEditorAPI.prototype.projectName = null;

    POEditorAPI.prototype.projectId = null;

    POEditorAPI.prototype.mapLangs = null;

    function POEditorAPI(options, callback) {
      this.apiToken = options.apiToken;
      this.projectName = options.project;
      if (this.apiToken == null) {
        callback("Missing parameter 'apiToken'");
        return;
      }
      if (this.projectName == null) {
        callback("Missing parameter 'project'");
        return;
      }
      if (options.langs != null) {
        this.mapLangs = options.langs;
      }
      this.listProjects((function(_this) {
        return function(err, data) {
          var i, len, project;
          if (err) {
            callback(err);
            return;
          }
          for (i = 0, len = data.length; i < len; i++) {
            project = data[i];
            if (project.name === _this.projectName) {
              _this.projectId = project.id;
            }
          }
          callback(null);
        };
      })(this));
      return;
    }

    POEditorAPI.prototype.request = function(params, callback) {
      var options;
      options = {
        url: this.host,
        form: {
          api_token: this.apiToken
        }
      };
      _.merge(options.form, params);
      request.post(options, (function(_this) {
        return function(error, response, body) {
          var data, e;
          if (error) {
            callback(error);
            return;
          }
          try {
            data = JSON.parse(body);
          } catch (_error) {
            e = _error;
            callback(e);
            return;
          }
          if ('status' in data.response && data.response.status === 'fail') {
            callback(data.response.message);
            return;
          }
          callback(null, data);
        };
      })(this));
    };

    POEditorAPI.prototype.listProjects = function(callback) {
      var params;
      params = {
        action: 'list_projects'
      };
      this.request(params, (function(_this) {
        return function(err, data) {
          if (err) {
            callback(err);
            return;
          }
          callback(null, data.list);
        };
      })(this));
    };

    POEditorAPI.prototype.listProjectLanguages = function(callback) {
      var params;
      if (!this.projectId) {
        callback('Property projectId is empty.');
        return;
      }
      params = {
        action: 'list_languages',
        id: this.projectId
      };
      this.request(params, (function(_this) {
        return function(err, data) {
          if (err) {
            callback(err);
            return;
          }
          callback(null, data.list);
        };
      })(this));
    };

    POEditorAPI.prototype.getProjectTerms = function(lang, callback) {
      var params;
      if (!this.projectId) {
        callback('Property projectId is empty.');
        return;
      }
      params = {
        action: 'view_terms',
        id: this.projectId,
        language: lang
      };
      this.request(params, (function(_this) {
        return function(err, data) {
          if (err) {
            callback(err);
            return;
          }
          callback(null, data.list, lang);
        };
      })(this));
    };

    POEditorAPI.prototype.syncTerms = function(terms, callback) {
      var params;
      if (!this.projectId) {
        callback('Property projectId is empty.');
        return;
      }
      params = {
        action: 'sync_terms',
        id: this.projectId,
        data: JSON.stringify(terms)
      };
      this.request(params, (function(_this) {
        return function(err, data) {
          if (err) {
            callback(err);
            return;
          }
          callback(null, data);
        };
      })(this));
    };

    POEditorAPI.prototype.updateProjectLanguage = function(lang, translates, callback) {
      var params;
      if (!this.projectId) {
        callback('Property projectId is empty.');
        return;
      }
      params = {
        action: 'update_language',
        id: this.projectId,
        language: lang,
        data: JSON.stringify(translates)
      };
      this.request(params, (function(_this) {
        return function(err, data) {
          if (err) {
            callback(err);
            return;
          }
          data.lang = lang;
          callback(null, data);
        };
      })(this));
    };

    return POEditorAPI;

  })();

  module.exports = POEditorAPI;

}).call(this);
