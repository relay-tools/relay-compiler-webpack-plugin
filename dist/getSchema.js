"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getSchema;

var _graphql = require("graphql");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSchema(schemaPath) {
  try {
    let source = _fs.default.readFileSync(schemaPath, 'utf8');

    if (_path.default.extname(schemaPath) === '.json') {
      source = (0, _graphql.printSchema)((0, _graphql.buildClientSchema)(JSON.parse(source).data));
    }

    source = `
  directive @include(if: Boolean) on FRAGMENT_SPREAD | FIELD
  directive @skip(if: Boolean) on FRAGMENT_SPREAD | FIELD

  ${source}
  `;
    return (0, _graphql.buildASTSchema)((0, _graphql.parse)(source));
  } catch (error) {
    throw new Error(`
Error loading schema. Expected the schema to be a .graphql or a .json
file, describing your GraphQL server's API. Error detail:

${error.stack}
    `.trim());
  }
}