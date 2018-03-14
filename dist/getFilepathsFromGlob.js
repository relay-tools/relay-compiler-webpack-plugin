'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getFilepathsFromGlob;

var _fastGlob = require('fast-glob');

var _fastGlob2 = _interopRequireDefault(_fastGlob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFilepathsFromGlob(baseDir, options) {
  const extensions = options.extensions,
        include = options.include,
        exclude = options.exclude;

  const patterns = include.map(inc => `${inc}/*.+(${extensions.join('|')})`);

  return _fastGlob2.default.sync(patterns, {
    cwd: baseDir,
    bashNative: [],
    onlyFiles: true,
    ignore: exclude
  });
}