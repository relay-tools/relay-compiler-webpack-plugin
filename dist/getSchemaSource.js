"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getSchemaSource;

var _fs = _interopRequireDefault(require("fs"));

var _graphql = require("graphql");

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Taken from relay-compiler/bin/RelayCompilerMain.js
function getSchemaSource(schemaPath) {
  let source = _fs.default.readFileSync(schemaPath, 'utf8');

  if (_path.default.extname(schemaPath) === '.json') {
    source = (0, _graphql.printSchema)((0, _graphql.buildClientSchema)(JSON.parse(source).data));
  }

  source = `
  directive @include(if: Boolean) on FRAGMENT_SPREAD | FIELD
  directive @skip(if: Boolean) on FRAGMENT_SPREAD | FIELD

  ${source}
  `;
  return new _graphql.Source(source, schemaPath);
}