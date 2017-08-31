'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getFilepathsFromGlob;
function getFilepathsFromGlob(baseDir, options) {
  const extensions = options.extensions,
        include = options.include,
        exclude = options.exclude;

  const patterns = include.map(inc => `${inc}/*.+(${extensions.join('|')})`);

  // $FlowFixMe(site=react_native_fb,www)
  const glob = require('fast-glob');
  return glob.sync(patterns, {
    cwd: baseDir,
    bashNative: [],
    onlyFiles: true,
    ignore: exclude
  });
}