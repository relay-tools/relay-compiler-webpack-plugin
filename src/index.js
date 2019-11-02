// @flow
import { Runner, DotGraphQLParser } from 'relay-compiler';
import RelayLanguagePluginJavaScript from 'relay-compiler/lib/language/javascript/RelayLanguagePluginJavaScript';
import type { PluginInterface } from 'relay-compiler/lib/language/RelayLanguagePluginInterface';
import RelaySourceModuleParser from 'relay-compiler/lib/core/RelaySourceModuleParser';

import fs from 'fs';
import path from 'path';

import type { GraphQLSchema } from 'graphql';
import type { Compiler, Compilation } from 'webpack';
import getSchemaSource from './getSchemaSource';
import getWriter from './getWriter';
import getFilepathsFromGlob from './getFilepathsFromGlob';
import getRelayCompilerPluginHooks from './getRelayCompilerPluginHooks';
import type { WriterConfig } from './getWriter';
import type { PluginHooks } from './getRelayCompilerPluginHooks';
import type { WebpackLogger } from './WebpackLogger';
import createRaiseErrorsReporter from './createRaiseErrorsReporter';

type RelayCompilerWebpackPluginOptions = {
    schema: string | GraphQLSchema,
    src: string,
    getParser?: Function,
    extensions: Array<string>,
    include: Array<string>,
    exclude: Array<string>,
    languagePlugin?: () => PluginInterface,
    artifactDirectory?: string,
    getReporter?: (logger?: WebpackLogger) => any,
    config: any
}

function createParserConfigs({
  baseDir,
  getParser,
  sourceParserName,
  languagePlugin,
  include,
  exclude,
  schema,
  extensions,
}: {
  baseDir: string,
  getParser?: Function,
  sourceParserName: string,
  languagePlugin: PluginInterface,
  schema: string | GraphQLSchema,
  include: Array<string>,
  exclude: Array<string>,
  extensions: Array<string>
}) {
  const schemaSource = getSchemaSource(schema);

  const sourceModuleParser = RelaySourceModuleParser(
    languagePlugin.findGraphQLTags,
  );

  const fileOptions = { extensions, include, exclude };

  return {
    [sourceParserName]: {
      baseDir,
      getFileFilter: sourceModuleParser.getFileFilter,
      getParser: getParser || sourceModuleParser.getParser,
      getSchemaSource: () => schemaSource,
      filepaths: getFilepathsFromGlob(baseDir, fileOptions),
    },
    graphql: {
      baseDir,
      getParser: DotGraphQLParser.getParser,
      getSchemaSource: () => schemaSource,
      filepaths: getFilepathsFromGlob(baseDir, {
        ...fileOptions,
        extensions: ['graphql'],
      }),
    },
  };
}

class RelayCompilerWebpackPlugin {
  parserConfigs: {}

  writerConfigs: {}

  languagePlugin: PluginInterface

  options: RelayCompilerWebpackPluginOptions

  static getHooks = getRelayCompilerPluginHooks

  constructor(options: RelayCompilerWebpackPluginOptions) {
    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.');
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema.');
    }

    if (typeof options.schema === 'string' && !fs.existsSync(options.schema)) {
      throw new Error(
        `Could not find the [schema] provided (${options.schema}).`,
      );
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.');
    }

    if (!fs.existsSync(options.src)) {
      throw new Error(`Could not find the [src] provided (${options.src})`);
    }

    this.options = options;
  }

  createWriterConfigs({
    sourceParserName,
    languagePlugin,
    config,
  }: {
    sourceParserName: string,
    languagePlugin: PluginInterface,
    config: WriterConfig,
  }) {
    return {
      [languagePlugin.outputExtension]: {
        writeFiles: getWriter(languagePlugin, config),
        isGeneratedFile: (filePath: string) => {
          if (filePath.endsWith(`.graphql.${languagePlugin.outputExtension}`)) {
            if (this.options.artifactDirectory) {
              return filePath.startsWith(this.options.artifactDirectory);
            }
            return filePath.includes('__generated__');
          }

          return false;
        },
        parser: sourceParserName,
        baseParsers: ['graphql'],
      },
    };
  }

  async compile(
    issuer: string,
    request: string,
    compilation: Compilation,
    hooks: PluginHooks,
  ): Promise<void> {
    let logger;

    // webpack 4.38+
    if (compilation.getLogger) {
      logger = compilation.getLogger('RelayCompilerPlugin');
    }

    const reporter = this.options.getReporter
      ? this.options.getReporter(logger)
      : createRaiseErrorsReporter(logger);

    // Can this be set up in constructor and use same instance every time?
    const runner = new Runner({
      parserConfigs: this.parserConfigs,
      writerConfigs: this.writerConfigs,
      reporter,
      onlyValidate: false,
      skipPersist: true,
    });

    return hooks.beforeWrite.promise()
      .then(() => runner.compile(this.languagePlugin.outputExtension))
      .then((compileResult) => hooks.afterWrite.promise(compileResult));
  }

  cachedCompiler(compilation: Compilation) {
    const hooks = getRelayCompilerPluginHooks(compilation);
    let result;
    return (issuer: string, request: string) => {
      if (!result) result = this.compile(issuer, request, compilation, hooks);
      return result;
    };
  }

  runCompile(
    compile: (issuer: string, request: string) => any,
    result: any,
    callback: (error: Error | null, value: string | typeof undefined) => void,
  ) {
    if (
      result
      && result.contextInfo.issuer
      && (this.options.artifactDirectory || result.request.match(/__generated__/))
    ) {
      const request = path.resolve(
        path.dirname(result.contextInfo.issuer),
        result.request,
      );

      if (this.options.artifactDirectory && !request.startsWith(this.options.artifactDirectory)) {
        callback(null, result);
        return;
      }

      compile(result.contextInfo.issuer, request)
        .then(() => callback(null, result))
        .catch((error) => callback(error));

      return;
    }

    callback(null, result);
  }

  apply(compiler: Compiler) {
    const { options } = this;
    const language = (options.languagePlugin || RelayLanguagePluginJavaScript)();

    const extensions = options.extensions !== undefined
      ? options.extensions
      : language.inputExtensions;
    const sourceParserName = extensions.join('/');
    const include = options.include !== undefined ? options.include : ['**'];
    const exclude = options.exclude !== undefined
      ? options.exclude
      : [
        '**/node_modules/**',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/__generated__/**',
      ];

    this.parserConfigs = createParserConfigs({
      sourceParserName,
      languagePlugin: language,
      include,
      exclude,
      schema: options.schema,
      getParser: options.getParser,
      baseDir: options.src,
      extensions,
    });

    this.writerConfigs = this.createWriterConfigs({
      sourceParserName,
      languagePlugin: language,
      config: {
        ...options.config,
        outputDir: options.artifactDirectory,
        baseDir: options.src,
      },
    });

    this.languagePlugin = language;

    if (compiler.hooks) {
      compiler.hooks.compilation.tap(
        'RelayCompilerWebpackPlugin',
        (compilation: Compilation, params) => {
          const compile = this.cachedCompiler(compilation);
          params.normalModuleFactory.hooks.beforeResolve.tapAsync(
            'RelayCompilerWebpackPlugin',
            (result, callback) => {
              this.runCompile(compile, result, callback);
            },
          );
        },
      );
    } else {
      compiler.plugin('compilation', (compilation: Compilation, params) => {
        const compile = this.cachedCompiler(compilation);
        params.normalModuleFactory.plugin(
          'before-resolve',
          (result, callback) => {
            this.runCompile(compile, result, callback);
          },
        );
      });
    }
  }
}

module.exports = RelayCompilerWebpackPlugin;
