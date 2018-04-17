// @flow

import {Runner, JSModuleParser, ConsoleReporter} from 'relay-compiler'
import fs from 'fs'
import path from 'path'

import getSchema from './getSchema'
import getFileFilter from './getFileFilter'
import getWriter from './getWriter'
import getFilepathsFromGlob from './getFilepathsFromGlob'

import type {GraphQLSchema} from 'graphql'
import type {Compiler} from 'webpack'
import type {GraphQLReporter} from 'relay-compiler/lib/GraphQLReporter'

class RelayCompilerWebpackPlugin {
  parserConfigs = {
    default: {
      baseDir: '',
      getFileFilter,
      getParser: JSModuleParser.getParser,
      getSchema: () => {
      },
      filepaths: null
    }
  }

  writerConfigs = {
    default: {
      getWriter: (...any: any) => {
      },
      isGeneratedFile: (filePath: string) =>
        filePath.endsWith('.js') && filePath.includes('__generated__'),
      parser: 'default'
    }
  }

  constructor(options: {
    schema: string | GraphQLSchema,
    src: string,
    extensions: Array<string>,
    include: Array<String>,
    exclude: Array<String>
  }) {
    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.')
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema.')
    }

    if (typeof options.schema === 'string' && !fs.existsSync(options.schema)) {
      throw new Error(
        'Could not find the Schema. Have you provided a fully resolved path?'
      )
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.')
    }

    if (!fs.existsSync(options.src)) {
      throw new Error(
        'Could not find your `src` path. Have you provided a fully resolved path?'
      )
    }

    const extensions =
      options.extensions !== undefined ? options.extensions : ['js']
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

    const fileOptions = {
      extensions,
      include,
      exclude
    }

    this.parserConfigs.default.baseDir = options.src
    this.parserConfigs.default.getSchema =
      typeof options.schema === 'string'
        ? () => getSchema(options.schema)
        : () => options.schema
    this.parserConfigs.default.filepaths = getFilepathsFromGlob(
      options.src,
      fileOptions
    )

    this.writerConfigs.default.getWriter = getWriter(options.src)
  }

  async compile(issuer: string, request: string) {
    const errors = []
    try {
      const runner = new Runner({
        parserConfigs: this.parserConfigs,
        writerConfigs: this.writerConfigs,
        reporter: new ConsoleReporter({quiet: true}),
        onlyValidate: false,
        skipPersist: true
      })

      await runner.compile('default')
    } catch (error) {
      errors.push(error)
    }

    if (errors.length) {
      throw errors[0]
    }
  }

  cachedCompiler() {
    let result
    return (issuer: string, request: string) => {
      if (!result) result = this.compile(issuer, request)
      return result
    }
  }

  runCompile (compile, result, callback) {
    if (result && result.contextInfo.issuer && result.request.match(/__generated__/)) {
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
      compiler.hooks.compilation.tap('RelayCompilerWebpackPlugin', (compilation, params) => {
        params.normalModuleFactory.hooks.beforeResolve
          .tap('RelayCompilerWebpackPlugin', (result, callback) => {
            this.runCompile(compile, result, callback)
          })
      })
    } else {
      compiler.plugin('compilation', (compilation, params) => {
        const compile = this.cachedCompiler()
        params.normalModuleFactory.plugin('before-resolve', (result, callback) => {
          this.runCompile(compile, result, callback)
        })
      })
    }
  }
}

module.exports = RelayCompilerWebpackPlugin
