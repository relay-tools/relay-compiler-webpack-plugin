"use strict";

var _relayCompiler = require("relay-compiler");

var _RelayLanguagePluginJavaScript = _interopRequireDefault(require("relay-compiler/lib/RelayLanguagePluginJavaScript"));

var _RelaySourceModuleParser = _interopRequireDefault(require("relay-compiler/lib/RelaySourceModuleParser"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getSchema = _interopRequireDefault(require("./getSchema"));

var _getWriter = _interopRequireDefault(require("./getWriter"));

var _getFilepathsFromGlob = _interopRequireDefault(require("./getFilepathsFromGlob"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Was using a ConsoleReporter with quiet true (which is essentially a no-op)
// This implements graphql-compiler GraphQLReporter
// https://github.com/facebook/relay/blob/v1.7.0/packages/graphql-compiler/reporters/GraphQLReporter.js
// Wasn't able to find a way to import the GraphQLReporter interface to declare that it is implemented
class RaiseErrorsReporter {
  reportMessage(message) {// process.stdout.write('Report message: ' + message + '\n');
  }

  reportTime(name, ms) {// process.stdout.write('Report time: ' + name + ' ' + ms + '\n');
  }

  reportError(caughtLocation, error) {
    // process.stdout.write('Report error: ' + caughtLocation + ' ' + error.toString() + '\n');
    throw error;
  }

}

class RelayCompilerWebpackPlugin {
  constructor(options) {
    _defineProperty(this, "parserConfigs", void 0);

    _defineProperty(this, "writerConfigs", void 0);

    _defineProperty(this, "languagePlugin", void 0);

    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.');
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema.');
    }

    if (typeof options.schema === 'string' && !_fs.default.existsSync(options.schema)) {
      throw new Error(`Could not find the [schema] provided (${options.schema}).`);
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.');
    }

    if (!_fs.default.existsSync(options.src)) {
      throw new Error(`Could not find the [src] provided (${options.src})`);
    }

    const language = (options.languagePlugin || _RelayLanguagePluginJavaScript.default)();

    const extensions = options.extensions !== undefined ? options.extensions : language.inputExtensions;
    const sourceParserName = extensions.join('/');
    const include = options.include !== undefined ? options.include : ['**'];
    const exclude = options.exclude !== undefined ? options.exclude : ['**/node_modules/**', '**/__mocks__/**', '**/__tests__/**', '**/__generated__/**'];
    this.parserConfigs = this.createParserConfigs({
      sourceParserName,
      languagePlugin: language,
      include,
      exclude,
      schema: options.schema,
      getParser: options.getParser,
      baseDir: options.src,
      extensions
    });
    this.writerConfigs = this.createWriterConfigs({
      sourceParserName,
      languagePlugin: language,
      config: _objectSpread({}, options.config, {
        outputDir: options.artifactDirectory,
        baseDir: options.src
      })
    });
    this.languagePlugin = language;
  }

  createParserConfigs({
    baseDir,
    getParser,
    sourceParserName,
    languagePlugin,
    include,
    exclude,
    schema,
    extensions
  }) {
    const schemaFn = typeof schema === 'string' ? () => (0, _getSchema.default)(schema) : () => schema;
    const sourceModuleParser = (0, _RelaySourceModuleParser.default)(languagePlugin.findGraphQLTags);
    const fileOptions = {
      extensions,
      include,
      exclude
    };
    return {
      [sourceParserName]: {
        baseDir,
        getFileFilter: sourceModuleParser.getFileFilter,
        getParser: getParser || sourceModuleParser.getParser,
        getSchema: schemaFn,
        filepaths: (0, _getFilepathsFromGlob.default)(baseDir, fileOptions)
      },
      graphql: {
        baseDir,
        getParser: _relayCompiler.DotGraphQLParser.getParser,
        getSchema: schemaFn,
        filepaths: (0, _getFilepathsFromGlob.default)(baseDir, _objectSpread({}, fileOptions, {
          extensions: ['graphql']
        }))
      }
    };
  }

  createWriterConfigs({
    sourceParserName,
    languagePlugin,
    config
  }) {
    return {
      [languagePlugin.outputExtension]: {
        writeFiles: (0, _getWriter.default)(languagePlugin, config),
        isGeneratedFile: filePath => filePath.endsWith('.graphql.' + languagePlugin.outputExtension) && filePath.includes('__generated__'),
        parser: sourceParserName,
        baseParsers: ['graphql']
      }
    };
  }

  async compile(issuer, request) {
    const errors = [];

    try {
      // Can this be set up in constructor and use same instance every time?
      const runner = new _relayCompiler.Runner({
        parserConfigs: this.parserConfigs,
        writerConfigs: this.writerConfigs,
        reporter: new RaiseErrorsReporter(),
        onlyValidate: false,
        skipPersist: true
      });
      return runner.compile(this.languagePlugin.outputExtension);
    } catch (error) {
      errors.push(error);
    }

    if (errors.length) {
      throw errors[0];
    }
  }

  cachedCompiler() {
    let result;
    return (issuer, request) => {
      if (!result) result = this.compile(issuer, request);
      return result;
    };
  }

  runCompile(compile, result, callback) {
    if (result && result.contextInfo.issuer && result.request.match(/__generated__/)) {
      const request = _path.default.resolve(_path.default.dirname(result.contextInfo.issuer), result.request);

      compile(result.contextInfo.issuer, request).then(() => callback(null, result)).catch(error => callback(error));
    } else {
      callback(null, result);
    }
  }

  apply(compiler) {
    if (compiler.hooks) {
      compiler.hooks.compilation.tap('RelayCompilerWebpackPlugin', (compilation, params) => {
        const compile = this.cachedCompiler();
        params.normalModuleFactory.hooks.beforeResolve.tapAsync('RelayCompilerWebpackPlugin', (result, callback) => {
          this.runCompile(compile, result, callback);
        });
      });
    } else {
      compiler.plugin('compilation', (compilation, params) => {
        const compile = this.cachedCompiler();
        params.normalModuleFactory.plugin('before-resolve', (result, callback) => {
          this.runCompile(compile, result, callback);
        });
      });
    }
  }

}

module.exports = RelayCompilerWebpackPlugin;