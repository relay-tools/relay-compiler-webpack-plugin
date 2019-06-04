"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RelayFileWriter = _interopRequireDefault(require("relay-compiler/lib/RelayFileWriter"));

var _RelayIRTransforms = _interopRequireDefault(require("relay-compiler/lib/RelayIRTransforms"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions
} = _RelayIRTransforms.default;

var _default = (languagePlugin, config) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter
}) => _RelayFileWriter.default.writeAll({
  config: _objectSpread({}, config, {
    compilerTransforms: {
      commonTransforms,
      codegenTransforms,
      fragmentTransforms,
      printTransforms,
      queryTransforms
    },
    customScalars: {},
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