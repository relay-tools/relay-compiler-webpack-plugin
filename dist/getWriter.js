"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RelayFileWriter = _interopRequireDefault(require("relay-compiler/lib/RelayFileWriter"));

var _RelayIRTransforms = _interopRequireDefault(require("relay-compiler/lib/RelayIRTransforms"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions
} = _RelayIRTransforms.default;

var _default = (baseDir, languagePlugin, noFutureProofEnums, outputDir) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter
}) => _RelayFileWriter.default.writeAll({
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
    optionalInputFieldsForFlow: [],
    schemaExtensions,
    useHaste: false,
    noFutureProofEnums,
    extension: languagePlugin.outputExtension,
    typeGenerator: languagePlugin.typeGenerator,
    outputDir
  },
  onlyValidate,
  schema,
  baseDocuments,
  documents,
  reporter,
  sourceControl
});

exports.default = _default;