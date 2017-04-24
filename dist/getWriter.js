'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getWriter;

var _relayCompiler = require('relay-compiler');

const codegenTransforms = _relayCompiler.IRTransforms.codegenTransforms,
      fragmentTransforms = _relayCompiler.IRTransforms.fragmentTransforms,
      printTransforms = _relayCompiler.IRTransforms.printTransforms,
      queryTransforms = _relayCompiler.IRTransforms.queryTransforms,
      schemaTransforms = _relayCompiler.IRTransforms.schemaTransforms;
function getWriter(baseDir) {
  return (onlyValidate, schema, documents, baseDocuments) => {
    return new _relayCompiler.FileWriter({
      config: {
        buildCommand: 'relay-compiler-webpack-plugin',
        compilerTransforms: {
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms
        },
        baseDir,
        schemaTransforms
      },
      onlyValidate,
      schema,
      baseDocuments,
      documents
    });
  };
}