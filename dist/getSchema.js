'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getSchema;

var _graphql = require('graphql');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getSchema(schemaPath) {
  try {
    let source = _fs2.default.readFileSync(schemaPath, 'utf8');
    source = `
      directive @include(if: Boolean) on FRAGMENT | FIELD
      directive @skip(if: Boolean) on FRAGMENT | FIELD
      directive @relay(pattern: Boolean, plural: Boolean) on FRAGMENT | FIELD
      ${source}
    `;
    return (0, _graphql.buildASTSchema)((0, _graphql.parse)(source));
  } catch (error) {
    throw new Error(`
Error loading schema. Expected the schema to be a .graphql file using the
GraphQL schema definition language. Error detail:

${error.stack}
    `.trim());
  }
}