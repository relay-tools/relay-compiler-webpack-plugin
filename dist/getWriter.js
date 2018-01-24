'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = getWriter;

var _relayCompiler = require('relay-compiler');

var _formatGeneratedModule = require('relay-compiler/lib/formatGeneratedModule');

var _formatGeneratedModule2 = _interopRequireDefault(_formatGeneratedModule);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const commonTransforms = _relayCompiler.IRTransforms.commonTransforms,
      codegenTransforms = _relayCompiler.IRTransforms.codegenTransforms,
      fragmentTransforms = _relayCompiler.IRTransforms.fragmentTransforms,
      printTransforms = _relayCompiler.IRTransforms.printTransforms,
      queryTransforms = _relayCompiler.IRTransforms.queryTransforms,
      schemaExtensions = _relayCompiler.IRTransforms.schemaExtensions;
function getWriter(baseDir) {
  return (config, ...args) => {
    const cfg = typeof config === 'object' ? config : {
      onlyValidate: config,
      schema: args[0],
      documents: args[1],
      baseDocuments: args[2],
      sourceControl: args[3],
      reporter: args[4]
    };
    return new _relayCompiler.FileWriter(_extends({}, cfg, {
      config: {
        baseDir,
        compilerTransforms: {
          commonTransforms,
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms
        },
        customScalars: {},
        formatModule: _formatGeneratedModule2.default,
        inputFieldWhiteListForFlow: [],
        schemaExtensions,
        useHaste: false
      }
    }));
  };
}