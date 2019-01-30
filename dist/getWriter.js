"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _RelayFileWriter = _interopRequireDefault(require("relay-compiler/lib/RelayFileWriter"));

var _RelayIRTransforms = _interopRequireDefault(require("relay-compiler/lib/RelayIRTransforms"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const commonTransforms = _RelayIRTransforms.default.commonTransforms,
      codegenTransforms = _RelayIRTransforms.default.codegenTransforms,
      fragmentTransforms = _RelayIRTransforms.default.fragmentTransforms,
      printTransforms = _RelayIRTransforms.default.printTransforms,
      queryTransforms = _RelayIRTransforms.default.queryTransforms,
      schemaExtensions = _RelayIRTransforms.default.schemaExtensions;

<<<<<<< HEAD
function getWriter(languagePlugin, baseDir, outputDir) {
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
        extension: languagePlugin.outputExtension,
        formatModule: languagePlugin.formatModule,
        inputFieldWhiteListForFlow: [],
        outputDir,
        schemaExtensions,
        typeGenerator: languagePlugin.typeGenerator,
        useHaste: false
      }
    }));
  };
}
=======
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
>>>>>>> 2.0.0
