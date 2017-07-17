(function() {
  var POEditorDownloader, _, fs, path, yaml;

  fs = require('fs');

  path = require('path');

  yaml = require('js-yaml');

  _ = require('lodash');

  POEditorDownloader = (function() {
    POEditorDownloader.prototype.languages = [];

    POEditorDownloader.prototype.files = [];

    POEditorDownloader.prototype.poeditor = null;

    function POEditorDownloader(poeditor, files, callback) {
      this.files = files;
      this.poeditor = poeditor;
      poeditor.listProjectLanguages((function(_this) {
        return function(err, data) {
          var i, lang, langObj, len, results, results1, tasks;
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
            tasks.push(lang);
            results1.push(poeditor.getProjectTerms(lang, function(err, data, lang) {
              var dir, j, len1, rawTerm, term, terms;
              if (err) {
                callback(err);
                return;
              }
              terms = {};
              for (j = 0, len1 = data.length; j < len1; j++) {
                term = data[j];
                dir = term.term.split('.')[0];
                if (!terms[dir]) {
                  terms[dir] = [];
                }
                rawTerm = term.term.split('.').slice(1).join('.');
                terms[dir].push({
                  key: rawTerm,
                  value: term.definition.form
                });
              }
              return _this.merge(lang, terms, function(err, data) {
                if (err) {
                  callback(err);
                  return;
                }
                results.push(data);
                tasks = _.pull(tasks, data.lang);
                if (!tasks.length) {
                  callback(null, results);
                }
              });
            }));
          }
          return results1;
        };
      })(this));
      return;
    }

    POEditorDownloader.prototype.merge = function(lang, terms, callback) {
      var addedTerms, content, data, dump, e, ext, file, fileObj, i, j, len, len1, mapLang, mergedFile, mergedFiles, modifiedStrings, pathFragment, ref, ref1, term, termDir;
      addedTerms = 0;
      modifiedStrings = 0;
      mergedFiles = [];
      mapLang = lang;
      if (_.has(this.poeditor.mapLangs, lang)) {
        mapLang = _.get(this.poeditor.mapLangs, lang);
      }
      for (termDir in terms) {
        mergedFile = null;
        ref = this.files;
        for (i = 0, len = ref.length; i < len; i++) {
          fileObj = ref[i];
          pathFragment = "" + termDir + path.sep + mapLang;
          if (fileObj.path.indexOf(termDir) > -1 && fileObj.path.indexOf(mapLang) > -1) {
            mergedFile = fileObj;
          }
        }
        if (mergedFile === null) {
          continue;
        }
        ext = path.extname(mergedFile.path).replace('.', '');
        try {
          content = mergedFile.contents.toString();
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
        ref1 = terms[termDir];
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          term = ref1[j];
          if (_.has(file, term.key)) {
            if (_.get(file, term.key) !== term.value) {
              _.set(file, term.key, term.value);
              modifiedStrings++;
            }
          } else if (term.value !== '') {
            _.set(file, term.key, term.value);
            addedTerms++;
          }
        }
        if (ext === 'neon' || ext === 'yml' || ext === 'yaml') {
          dump = yaml.safeDump(file);
          dump = dump.replace(/\ \ /g, '\t');
        } else if (ext === 'json') {
          dump = JSON.stringify(file, null, '\t');
        } else {
          callback("File extension '" + ext + "' is not supported.");
        }
        mergedFile.contents = new Buffer(dump);
        mergedFiles.push(mergedFile);
      }
      data = {
        lang: lang,
        added: addedTerms,
        modified: modifiedStrings,
        mergedFiles: mergedFiles
      };
      callback(null, data);
    };

    return POEditorDownloader;

  })();

  module.exports = POEditorDownloader;

}).call(this);
