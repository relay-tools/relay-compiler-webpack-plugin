"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getFileFilter;

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFileFilter(baseDir) {
  return file => {
    const fullPath = _path.default.join(baseDir, file.relPath);

    const stats = _fs.default.statSync(fullPath);

    if (stats.isFile()) {
      const text = _fs.default.readFileSync(fullPath, 'utf8');

      return text.includes('graphql');
    }

    return false;
  };
}