// @flow

import { Runner } from 'relay-compiler'
import RelayLanguagePluginJavaScript from 'relay-compiler/lib/RelayLanguagePluginJavaScript'
import RelaySourceModuleParser from 'relay-compiler/lib/RelaySourceModuleParser'
import { DotGraphQLParser } from 'graphql-compiler'

import fs from 'fs'
import path from 'path'

import getSchema from './getSchema'
import getWriter from './getWriter'
import getFilepathsFromGlob from './getFilepathsFromGlob'

import type { GraphQLSchema } from 'graphql'
import type { Compiler } from 'webpack'

// Was using a ConsoleReporter with quiet true (which is essentially a no-op)
// This implements graphql-compiler GraphQLReporter
// https://github.com/facebook/relay/blob/v1.7.0/packages/graphql-compiler/reporters/GraphQLReporter.js
// Wasn't able to find a way to import the GraphQLReporter interface to declare that it is implemented
class RaiseErrorsReporter {
  reportMessage (message: string): void {
    // process.stdout.write('Report message: ' + message + '\n');
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

  constructor (options: {
    schema: string | GraphQLSchema,
    src: string,
    getParser?: Function,
    extensions: Array<string>,
    include: Array<string>,
    exclude: Array<string>,
    languagePlugin?: Function,
    artifactDirectory?: string
  }) {
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
      artifactDirectory: options.artifactDirectory,
      baseDir: options.src,
      sourceParserName,
      languagePlugin: language
    })
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
    languagePlugin: any,
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
    baseDir,
    sourceParserName,
    languagePlugin,
    artifactDirectory
  }: {
    baseDir: string,
    sourceParserName: string,
    languagePlugin: any,
    artifactDirectory: ?string
  }) {
    return {
      [languagePlugin.outputExtension]: {
        getWriter: getWriter(languagePlugin, baseDir, artifactDirectory),
        isGeneratedFile: (filePath: string) =>
          filePath.endsWith('.graphql.' + languagePlugin.outputExtension) &&
          filePath.includes('__generated__'),
        parser: sourceParserName,
        baseParsers: ['graphql']
      }
    }
  }

  async compile (issuer: string, request: string) {
    const errors = []
    try {
      // Can this be set up in constructor and use same instance every time?
      const runner = new Runner({
        parserConfigs: this.parserConfigs,
        writerConfigs: this.writerConfigs,
        reporter: new RaiseErrorsReporter(),
        onlyValidate: false,
        skipPersist: true
      })
      return runner.compile('js')
    } catch (error) {
      errors.push(error)
    }

    if (errors.length) {
      throw errors[0]
    }
  }

  cachedCompiler () {
    let result
    return (issuer: string, request: string) => {
      if (!result) result = this.compile(issuer, request)
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
      result.request.match(/__generated__/)
    ) {
      const request = path.resolve(
        path.dirname(result.contextInfo.issuer),
        result.request
      )
      compile(result.contextInfo.issuer, request)
        .then(() => callback(null, result))
        .catch(error => callback(error))
    } else {
      callback(null, result)
    }
  }

  apply (compiler: Compiler) {
    if (compiler.hooks) {
      compiler.hooks.compilation.tap(
        'RelayCompilerWebpackPlugin',
        (compilation, params) => {
          const compile = this.cachedCompiler()
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
        const compile = this.cachedCompiler()
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
