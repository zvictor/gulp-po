Gulp-PO
=======

Gulp extension for synchronizing translates from POEditor.

Installation
------------

```
npm install gulp-po
```

Usage
-----

Allowed actions: 

- `push`: Pushes all terms and translates to the POEditor server
- `pull`: Pulls all translates from the POEditor server and replace changed ones in files
- `sync`: Pushes all terms to the POEditor server

You can provide translate files in following formats: `JSON`, `YAML`, `NEON`

```js
var poConnector = require('gulp-po');

createTranslatesPlumber: function() {
    return plumber(function(error) {
        gutil.log(gutil.colors.red(error));
        gutil.beep();
        this.emit('end');
    });
}

gulp.task('translates-push', function() {
	return gulp.src('./translates/**/*.json')
		.pipe(pipes.createTranslatesPlumber())
		.pipe(poConnector('push', options))
		.pipe(gulp.dest('./translates/'))
});
```

### Options

Required parameters: 
 
- `apiToken`: Token generated on POEditor website
- `project`: Name of the project

Optional parameters:

- `langs`: Object of language mapping. You can map `key` to `val`, where `key` is original POEditor code, e.g. `zh-TW` to `zh`

Example:

```js
var options = {
	apiToken: '19xf1dfbfy36b96f0ba9f7zd94a83d9e',
	project: 'ExampleProject',
	langs: {
	    'zh-TW': 'zh'
	}
};
```

License
-------

(MIT License)

Copyright (c) 2015 Smartsupp.com info@smartsupp.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.