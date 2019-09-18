// @flow
import { Runner, DotGraphQLParser } from 'relay-compiler'
import RelayLanguagePluginJavaScript from 'relay-compiler/lib/language/javascript/RelayLanguagePluginJavaScript'
import type { PluginInterface } from 'relay-compiler/lib/language/RelayLanguagePluginInterface'
import RelaySourceModuleParser from 'relay-compiler/lib/core/RelaySourceModuleParser'

import fs from 'fs'
import path from 'path'

import getSchema from './getSchema'
import getWriter from './getWriter'
import getFilepathsFromGlob from './getFilepathsFromGlob'

import type { GraphQLSchema } from 'graphql'
import type { Compiler, Compilation } from 'webpack'
import type { WriterConfig } from './getWriter'

interface WebpackLogger {
  log(any): void;
  info(any): void;
  warn(any): void;
  error(any): void;
  debug(any): void;
}

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

// Was using a ConsoleReporter with quiet true (which is essentially a no-op)
// This implements graphql-compiler GraphQLReporter
// https://github.com/facebook/relay/blob/v1.7.0/packages/graphql-compiler/reporters/GraphQLReporter.js
// Wasn't able to find a way to import the GraphQLReporter interface to declare that it is implemented
class RaiseErrorsReporter {
  logger: ?WebpackLogger;

  constructor (logger?: WebpackLogger) {
    this.logger = logger
  }

  reportMessage (message: string): void {
    if (this.logger) this.logger.log(message)
    else console.log(message)
  }

  reportTime (name: string, ms: number): void {
    // process.stdout.write('Report time: ' + name + ' ' + ms + '\n');
  }

  reportError (caughtLocation: string, error: Error): void {
    // process.stdout.write('Report error: ' + caughtLocation + ' ' + error.toString() + '\n');
    throw error
  }
}

class RelayCompilerWebpackPlugin {
  parserConfigs: {}

  writerConfigs: {}

  languagePlugin: PluginInterface

  options: RelayCompilerWebpackPluginOptions

  constructor (options: RelayCompilerWebpackPluginOptions) {
    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.')
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema.')
    }

    if (typeof options.schema === 'string' && !fs.existsSync(options.schema)) {
      throw new Error(
        `Could not find the [schema] provided (${options.schema}).`
      )
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.')
    }

    if (!fs.existsSync(options.src)) {
      throw new Error(`Could not find the [src] provided (${options.src})`)
    }

    this.options = options
  }

  createParserConfigs ({
    baseDir,
    getParser,
    sourceParserName,
    languagePlugin,
    include,
    exclude,
    schema,
    extensions
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
    const schemaFn =
      typeof schema === 'string' ? () => getSchema(schema) : () => schema

    const sourceModuleParser = RelaySourceModuleParser(
      languagePlugin.findGraphQLTags
    )

    const fileOptions = { extensions, include, exclude }

    return {
      [sourceParserName]: {
        baseDir,
        getFileFilter: sourceModuleParser.getFileFilter,
        getParser: getParser || sourceModuleParser.getParser,
        getSchema: schemaFn,
        filepaths: getFilepathsFromGlob(baseDir, fileOptions)
      },
      graphql: {
        baseDir,
        getParser: DotGraphQLParser.getParser,
        getSchema: schemaFn,
        filepaths: getFilepathsFromGlob(baseDir, {
          ...fileOptions,
          extensions: ['graphql']
        })
      }
    }
  }

  createWriterConfigs ({
    sourceParserName,
    languagePlugin,
    config
  }: {
    sourceParserName: string,
    languagePlugin: PluginInterface,
    config: WriterConfig,
  }) {
    return {
      [languagePlugin.outputExtension]: {
        writeFiles: getWriter(languagePlugin, config),
        isGeneratedFile: (filePath: string) => {
          if (filePath.endsWith('.graphql.' + languagePlugin.outputExtension)) {
            if (this.options.artifactDirectory) {
              return filePath.startsWith(this.options.artifactDirectory)
            } else {
              return filePath.includes('__generated__')
            }
          }

          return false
        },
        parser: sourceParserName,
        baseParsers: ['graphql']
      }
    }
  }

  async compile (issuer: string, request: string, compilation: Compilation) {
    const errors = []
    try {
      let logger

      // webpack 4.38+
      if (compilation.getLogger) {
        logger = compilation.getLogger('RelayCompilerPlugin')
      }

      const reporter = this.options.getReporter
        ? this.options.getReporter(logger)
        : new RaiseErrorsReporter(logger)

      // Can this be set up in constructor and use same instance every time?
      const runner = new Runner({
        reporter,
        parserConfigs: this.parserConfigs,
        writerConfigs: this.writerConfigs,
        onlyValidate: false,
        skipPersist: true
      })
      return runner.compile(this.languagePlugin.outputExtension)
    } catch (error) {
      errors.push(error)
    }

    if (errors.length) {
      throw errors[0]
    }
  }

  cachedCompiler (compilation: Compilation) {
    let result
    return (issuer: string, request: string) => {
      if (!result) result = this.compile(issuer, request, compilation)
      return result
    }
  }

  runCompile (
    compile: (issuer: string, request: string) => any,
    result: any,
    callback: (error: Error | null, value: string | typeof undefined) => void
  ) {
    if (
      result &&
      result.contextInfo.issuer &&
      (this.options.artifactDirectory || result.request.match(/__generated__/))
    ) {
      const request = path.resolve(
        path.dirname(result.contextInfo.issuer),
        result.request
      )

      if (this.options.artifactDirectory && !request.startsWith(this.options.artifactDirectory)) {
        callback(null, result)
        return
      }

      compile(result.contextInfo.issuer, request)
        .then(() => callback(null, result))
        .catch(error => callback(error))

      return
    }

    callback(null, result)
  }

  apply (compiler: Compiler) {
    const { options } = this
    const language = (options.languagePlugin || RelayLanguagePluginJavaScript)()

    const extensions =
      options.extensions !== undefined
        ? options.extensions
        : language.inputExtensions
    const sourceParserName = extensions.join('/')
    const include = options.include !== undefined ? options.include : ['**']
    const exclude =
      options.exclude !== undefined
        ? options.exclude
        : [
          '**/node_modules/**',
          '**/__mocks__/**',
          '**/__tests__/**',
          '**/__generated__/**'
        ]

    this.parserConfigs = this.createParserConfigs({
      sourceParserName,
      languagePlugin: language,
      include,
      exclude,
      schema: options.schema,
      getParser: options.getParser,
      baseDir: options.src,
      extensions
    })

    this.writerConfigs = this.createWriterConfigs({
      sourceParserName,
      languagePlugin: language,
      config: {
        ...options.config,
        outputDir: options.artifactDirectory,
        baseDir: options.src
      }
    })

    this.languagePlugin = language

    if (compiler.hooks) {
      compiler.hooks.compilation.tap(
        'RelayCompilerWebpackPlugin',
        (compilation, params) => {
          const compile = this.cachedCompiler(compilation)
          params.normalModuleFactory.hooks.beforeResolve.tapAsync(
            'RelayCompilerWebpackPlugin',
            (result, callback) => {
              this.runCompile(compile, result, callback)
            }
          )
        }
      )
    } else {
      compiler.plugin('compilation', (compilation, params) => {
        const compile = this.cachedCompiler(compilation)
        params.normalModuleFactory.plugin(
          'before-resolve',
          (result, callback) => {
            this.runCompile(compile, result, callback)
          }
        )
      })
    }
  }
}

module.exports = RelayCompilerWebpackPlugin
