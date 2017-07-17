(function() {
  var POEditorUploader, _, fs, path, yaml;

  fs = require('fs');

  yaml = require('js-yaml');

  path = require('path');

  _ = require('lodash');

  POEditorUploader = (function() {
    POEditorUploader.prototype.terms = [];

    POEditorUploader.prototype.parents = [];

    POEditorUploader.prototype.languages = [];

    POEditorUploader.prototype.files = [];

    POEditorUploader.prototype.poeditor = null;

    POEditorUploader.prototype.lang = null;

    function POEditorUploader(poeditor, files, callback) {
      var content, dirName, e, ext, file, fileObj, i, j, len, len1, ref, term, terms;
      this.poeditor = poeditor;
      this.files = files;
      for (i = 0, len = files.length; i < len; i++) {
        fileObj = files[i];
        ext = path.extname(fileObj.path).replace('.', '');
        try {
          content = fileObj.contents.toString();
          content = content.replace(/\t/g, '  ');
          if (ext === 'neon' || ext === 'yml' || ext === 'yaml') {
            file = yaml.safeLoad(content);
          } else if (ext === 'json') {
            file = JSON.parse(content);
          } else {
            callback("File extension '" + ext + "' is not supported.");
          }
        } catch (_error) {
          e = _error;
          callback(e);
          return;
        }
        this.lang = path.basename(fileObj.path).split('.')[1];
        dirName = fileObj.path.split(path.sep).slice(-2)[0];
        this.parents = [];
        this.parents.push(dirName);
        this.traverse(file);
      }
      terms = [];
      ref = this.terms;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        term = ref[j];
        terms.push({
          term: term.term
        });
      }
      this.poeditor.syncTerms(terms, (function(_this) {
        return function(err, data) {
          if (err) {
            callback(err);
            return;
          }
          callback(null, data);
        };
      })(this));
      return;
    }

    POEditorUploader.prototype.traverse = function(nodes) {
      var node, term, termObj;
      for (node in nodes) {
        if (_.isObject(nodes[node])) {
          this.parents.push(node);
          this.traverse(nodes[node]);
        } else {
          term = this.parents.join('.');
          term += '.' + node;
          termObj = this.findByTerm(term);
          if (termObj !== null) {
            termObj[this.lang] = nodes[node];
          } else {
            termObj = {
              term: term
            };
            termObj[this.lang] = nodes[node];
            this.terms.push(termObj);
          }
        }
      }
      this.parents.splice(-1, 1);
    };

    POEditorUploader.prototype.findByTerm = function(term) {
      var i, len, ref, termObj;
      ref = this.terms;
      for (i = 0, len = ref.length; i < len; i++) {
        termObj = ref[i];
        if (termObj.term === term) {
          return termObj;
        }
      }
      return null;
    };

    POEditorUploader.prototype.uploadTranslates = function(callback) {
      this.poeditor.listProjectLanguages((function(_this) {
        return function(err, data) {
          var forms, i, j, lang, langObj, len, len1, mapLang, ref, results, results1, tasks, termObj, translates;
          if (err) {
            callback(err);
            return;
          }
          results = [];
          tasks = [];
          results1 = [];
          for (i = 0, len = data.length; i < len; i++) {
            langObj = data[i];
            lang = langObj.code;
            translates = [];
            tasks.push(lang);
            mapLang = lang;
            if (_.has(_this.poeditor.mapLangs, lang)) {
              mapLang = _.get(_this.poeditor.mapLangs, lang);
            }
            ref = _this.terms;
            for (j = 0, len1 = ref.length; j < len1; j++) {
              termObj = ref[j];
              if (_.has(termObj, mapLang)) {
                forms = [];
                forms.push(termObj[mapLang]);
                translates.push({
                  term: {
                    term: termObj.term
                  },
                  definition: {
                    forms: forms
                  }
                });
              }
            }
            if (!translates.length) {
              tasks = _.pull(tasks, lang);
              continue;
            }
            results1.push(_this.poeditor.updateProjectLanguage(lang, translates, function(err, data) {
              if (err) {
                callback(err);
                return;
              }
              results.push(data);
              tasks = _.pull(tasks, data.lang);
              if (!tasks.length) {
                callback(null, results);
              }
            }));
          }
          return results1;
        };
      })(this));
    };

    return POEditorUploader;

  })();

  module.exports = POEditorUploader;

}).call(this);
