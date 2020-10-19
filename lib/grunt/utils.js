'use strict';

var fs = require('fs');
var grunt = require('grunt');

var CSP_CSS_HEADER = '/* Include this file in your html if you are using the CSP mode. */\n\n';

module.exports = {
  wrap(src, name) {
    return [`src/${name}.prefix`, ...src, `src/${name}.suffix`];
  },
  addStyle: function(src, styles, minify) {
    styles = styles.reduce(processCSS.bind(this), {
      js: [src],
      css: []
    });
    return {
      js: styles.js.join('\n'),
      css: styles.css.join('\n')
    };

    function processCSS(state, file) {
      var css = fs.readFileSync(file).toString(),
        js;
      state.css.push(css);

      if (minify) {
        css = css
          .replace(/\r?\n/g, '')
          .replace(/\/\*.*?\*\//g, '')
          .replace(/:\s+/g, ':')
          .replace(/\s*\{\s*/g, '{')
          .replace(/\s*\}\s*/g, '}')
          .replace(/\s*,\s*/g, ',')
          .replace(/\s*;\s*/g, ';');
      }
      //escape for js
      css = css
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\\'')
        .replace(/\r?\n/g, '\\n');
      js = '!window.angular.$$csp().noInlineStyle && window.angular.element(document.head).prepend(window.angular.element(\'<style>\').text(\'' + css + '\'));';
      state.js.push(js);

      return state;
    }
  },
  process: function(src, NG_VERSION, strict) {
    var processed = src
      .replace(/(['"])NG_VERSION_FULL\1/g, NG_VERSION.full)
      .replace(/(['"])NG_VERSION_MAJOR\1/, NG_VERSION.major)
      .replace(/(['"])NG_VERSION_MINOR\1/, NG_VERSION.minor)
      .replace(/(['"])NG_VERSION_DOT\1/, NG_VERSION.patch)
      .replace(/(['"])NG_VERSION_CDN\1/, NG_VERSION.cdn)
      .replace(/(['"])NG_VERSION_CODENAME\1/, NG_VERSION.codeName);
    if (strict !== false) processed = this.singleStrict(processed, '\n\n', true);
    return processed;
  },
  build: function(config, fn) {
    var files = grunt.file.expand(config.src);
    // grunt.file.expand might reorder the list of files
    // when it is expanding globs, so we use prefix and suffix
    // fields to ensure that files are at the start of end of
    // the list (primarily for wrapping in an IIFE).
    if (config.prefix) {
      files = grunt.file.expand(config.prefix).concat(files);
    }
    if (config.suffix) {
      files = files.concat(grunt.file.expand(config.suffix));
    }
    var styles = config.styles;
    var processedStyles;
    //concat
    var src = files.map(function(filepath) {
      return grunt.file.read(filepath);
    }).join(grunt.util.normalizelf('\n'));
    //process
    var processed = this.process(src, grunt.config('NG_VERSION'), config.strict);
    if (styles) {
      processedStyles = this.addStyle(processed, styles.css, styles.minify);
      processed = processedStyles.js;
      if (config.styles.generateCspCssFile) {
        grunt.file.write(removeSuffix(config.dest) + '-csp.css', CSP_CSS_HEADER + processedStyles.css);
      }
    }
    //write
    grunt.file.write(config.dest, processed);
    grunt.log.ok('File ' + config.dest + ' created.');
    fn();

    function removeSuffix(fileName) {
      return fileName.replace(/\.js$/, '');
    }
  },
  singleStrict: function(src, insert) {
    return src
      .replace(/\s*("|')use strict("|');\s*/g, insert) // remove all file-specific strict mode flags
      .replace(/(\(function\([^)]*\)\s*\{)/, '$1\'use strict\';'); // add single strict mode flag
  }
};
