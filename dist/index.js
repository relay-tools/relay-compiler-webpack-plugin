"use strict";

var _relayCompiler = require("relay-compiler");

var _graphqlCompiler = require("graphql-compiler");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _getSchema = _interopRequireDefault(require("./getSchema"));

var _getFileFilter = _interopRequireDefault(require("./getFileFilter"));

var _getWriter = _interopRequireDefault(require("./getWriter"));

var _getFilepathsFromGlob = _interopRequireDefault(require("./getFilepathsFromGlob"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Was using a ConsoleReporter with quiet true (which is essentially a no-op)
// This implements graphql-compiler GraphQLReporter
// https://github.com/facebook/relay/blob/v1.7.0/packages/graphql-compiler/reporters/GraphQLReporter.js
// Not familiar enough with flow yet to get that working
class TemporaryReporter {
  reportMessage(message) {//process.stdout.write('Report message: ' + message + '\n');
  }

  reportTime(name, ms) {//process.stdout.write('Report time: ' + name + ' ' + ms + '\n');
  }

  reportError(caughtLocation, error) {
    // process.stdout.write('Report error: ' + caughtLocation + ' ' + error.toString() + '\n');
    throw error;
  }

}

class RelayCompilerWebpackPlugin {
  constructor(options) {
    _defineProperty(this, "runner", void 0);

    _defineProperty(this, "parserConfigs", {
      js: {
        baseDir: '',
        getFileFilter: _getFileFilter.default,
        getParser: _relayCompiler.JSModuleParser.getParser,
        getSchema: () => {},
        filepaths: null
      },
      graphql: {
        baseDir: '',
        getParser: _graphqlCompiler.DotGraphQLParser.getParser,
        getSchema: () => {},
        filepaths: null
      }
    });

    _defineProperty(this, "writerConfigs", {
      js: {
        getWriter: (...any) => {},
        isGeneratedFile: filePath => filePath.endsWith('.js') && filePath.includes('__generated__'),
        parser: 'js',
        baseParsers: ['graphql']
      }
    });

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

    const extensions = options.extensions !== undefined ? options.extensions : ['js'];
    const include = options.include !== undefined ? options.include : ['**'];
    const exclude = options.exclude !== undefined ? options.exclude : ['**/node_modules/**', '**/__mocks__/**', '**/__tests__/**', '**/__generated__/**'];
    const fileOptions = {
      extensions,
      include,
      exclude
    };
    const schemaFn = typeof options.schema === 'string' ? () => (0, _getSchema.default)(options.schema) : () => options.schema;
    if (options.getParser !== undefined) this.parserConfigs.js.getParser = options.getParser;
    this.parserConfigs.js.baseDir = options.src;
    this.parserConfigs.js.getSchema = schemaFn;
    this.parserConfigs.js.filepaths = (0, _getFilepathsFromGlob.default)(options.src, fileOptions);
    this.writerConfigs.js.getWriter = (0, _getWriter.default)(options.src);
    this.parserConfigs.graphql.baseDir = options.src;
    this.parserConfigs.graphql.getSchema = schemaFn;
    this.parserConfigs.graphql.filepaths = (0, _getFilepathsFromGlob.default)(options.src, _objectSpread({}, fileOptions, {
      extensions: ['graphql']
    }));
  }

  compile(issuer, request) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const errors = [];

      try {
        const runner = new _relayCompiler.Runner({
          parserConfigs: _this.parserConfigs,
          writerConfigs: _this.writerConfigs,
          reporter: new TemporaryReporter(),
          onlyValidate: false,
          skipPersist: true
        });
        return runner.compile('js');
      } catch (error) {
        errors.push(error);
      }

      if (errors.length) {
        throw errors[0];
      }
    })();
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