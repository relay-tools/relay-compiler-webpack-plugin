"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getFilepathsFromGlob;

var _fastGlob = _interopRequireDefault(require("fast-glob"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFilepathsFromGlob(baseDir, options) {
  const extensions = options.extensions,
        include = options.include,
        exclude = options.exclude;
  const patterns = include.map(inc => `${inc}/*.+(${extensions.join('|')})`);
  return _fastGlob.default.sync(patterns, {
    cwd: baseDir,
    bashNative: [],
    onlyFiles: true,
    dot: true,
    // match behavior of watchman from relay-compiler
    ignore: exclude
  });
}