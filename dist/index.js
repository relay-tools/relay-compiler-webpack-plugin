'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _relayCompiler = require('relay-compiler');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _getSchema = require('./getSchema');

var _getSchema2 = _interopRequireDefault(_getSchema);

var _getFileFilter = require('./getFileFilter');

var _getFileFilter2 = _interopRequireDefault(_getFileFilter);

var _getWriter = require('./getWriter');

var _getWriter2 = _interopRequireDefault(_getWriter);

var _getFilepathsFromGlob = require('./getFilepathsFromGlob');

var _getFilepathsFromGlob2 = _interopRequireDefault(_getFilepathsFromGlob);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

let GraphQLLib; // Support pre 1.6 relay
try {
  GraphQLLib = require('graphql-compiler');
} catch (e) {
  // $FlowFixMe
  GraphQLLib = require('relay-compiler/lib/GraphQLCompilerPublic');
}
const DotGraphQLParser = GraphQLLib.DotGraphQLParser;

class RelayCompilerWebpackPlugin {

  constructor(options) {
    this.parserConfigs = {
      js: {
        baseDir: '',
        getFileFilter: _getFileFilter2.default,
        getParser: _relayCompiler.JSModuleParser.getParser,
        getSchema: () => {},
        filepaths: null
      },
      graphql: {
        baseDir: '',
        getParser: DotGraphQLParser.getParser,
        getSchema: () => {},
        filepaths: null
      }
    };
    this.writerConfigs = {
      js: {
        getWriter: (...any) => {},
        isGeneratedFile: filePath => filePath.endsWith('.js') && filePath.includes('__generated__'),
        parser: 'js',
        baseParsers: ['graphql']

      }
    };

    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.');
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema.');
    }

    if (typeof options.schema === 'string' && !_fs2.default.existsSync(options.schema)) {
      throw new Error('Could not find the Schema. Have you provided a fully resolved path?');
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.');
    }

    if (!_fs2.default.existsSync(options.src)) {
      throw new Error('Could not find your `src` path. Have you provided a fully resolved path?');
    }

    const extensions = options.extensions !== undefined ? options.extensions : ['js'];
    const include = options.include !== undefined ? options.include : ['**'];
    const exclude = options.exclude !== undefined ? options.exclude : ['**/node_modules/**', '**/__mocks__/**', '**/__tests__/**', '**/__generated__/**'];

    const fileOptions = {
      extensions,
      include,
      exclude
    };
    const schemaFn = typeof options.schema === 'string' ? () => (0, _getSchema2.default)(options.schema) : () => options.schema;

    if (options.getParser !== undefined) this.parserConfigs.js.getParser = options.getParser;
    this.parserConfigs.js.baseDir = options.src;
    this.parserConfigs.js.getSchema = schemaFn;
    this.parserConfigs.js.filepaths = (0, _getFilepathsFromGlob2.default)(options.src, fileOptions);
    this.writerConfigs.js.getWriter = (0, _getWriter2.default)(options.src);

    this.parserConfigs.graphql.baseDir = options.src;
    this.parserConfigs.graphql.getSchema = schemaFn;
    this.parserConfigs.graphql.filepaths = (0, _getFilepathsFromGlob2.default)(options.src, _extends({}, fileOptions, { extensions: ['graphql'] }));
  }

  compile(issuer, request) {
    var _this = this;

    return _asyncToGenerator(function* () {
      const errors = [];
      try {
        const runner = new _relayCompiler.Runner({
          parserConfigs: _this.parserConfigs,
          writerConfigs: _this.writerConfigs,
          reporter: new _relayCompiler.ConsoleReporter({ quiet: true }),
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
      const request = _path2.default.resolve(_path2.default.dirname(result.contextInfo.issuer), result.request);
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