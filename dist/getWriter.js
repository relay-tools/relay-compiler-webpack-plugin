"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getWriter;

var _relayCompiler = require("relay-compiler");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const commonTransforms = _relayCompiler.IRTransforms.commonTransforms,
      codegenTransforms = _relayCompiler.IRTransforms.codegenTransforms,
      fragmentTransforms = _relayCompiler.IRTransforms.fragmentTransforms,
      printTransforms = _relayCompiler.IRTransforms.printTransforms,
      queryTransforms = _relayCompiler.IRTransforms.queryTransforms,
      schemaExtensions = _relayCompiler.IRTransforms.schemaExtensions;

function getWriter(languagePlugin, baseDir) {
  return (config, ...args) => {
    const cfg = typeof config === 'object' ? config : {
      onlyValidate: config,
      schema: args[0],
      documents: args[1],
      baseDocuments: args[2],
      sourceControl: args[3],
      reporter: args[4]
    };
    return new _relayCompiler.FileWriter(_objectSpread({}, cfg, {
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
        formatModule: languagePlugin.formatModule,
        inputFieldWhiteListForFlow: [],
        schemaExtensions,
        extension: languagePlugin.outputExtension,
        typeGenerator: languagePlugin.typeGenerator,
        useHaste: false
      }
    }));
  };
}