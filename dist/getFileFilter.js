'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getFileFilter;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFileFilter(baseDir) {
  return file => {
    const fullPath = _path2.default.join(baseDir, file.relPath);
    const stats = _fs2.default.statSync(fullPath);

    if (stats.isFile()) {
      const text = _fs2.default.readFileSync(fullPath, 'utf8');
      return text.includes('graphql');
    }

    return false;
  };
}