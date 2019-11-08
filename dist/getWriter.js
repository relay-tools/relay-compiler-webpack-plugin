"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _relayCompiler = require("relay-compiler");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions
} = _relayCompiler.IRTransforms; // Taken from relay-compiler/bin/RelayCompilerMain.js

var _default = (languagePlugin, config) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter
}) => _relayCompiler.FileWriter.writeAll({
  config: _objectSpread({
    customScalars: {}
  }, config, {
    compilerTransforms: {
      commonTransforms,
      codegenTransforms,
      fragmentTransforms,
      printTransforms,
      queryTransforms
    },
    formatModule: languagePlugin.formatModule,
    optionalInputFieldsForFlow: [],
    schemaExtensions,
    useHaste: false,
    extension: languagePlugin.outputExtension,
    typeGenerator: languagePlugin.typeGenerator
  }),
  onlyValidate,
  schema,
  baseDocuments,
  documents,
  reporter,
  sourceControl
});

exports.default = _default;