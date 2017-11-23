// @flow

import { Runner, FileIRParser, ConsoleReporter } from 'relay-compiler'
import fs from 'fs'

import getSchema from './getSchema'
import getFileFilter from './getFileFilter'
import getWriter from './getWriter'
import getFilepathsFromGlob from './getFilepathsFromGlob'

import type { Compiler } from 'webpack'

class RelayCompilerWebpackPlugin {
  parserConfigs = {
    default: {
      schema: '',
      baseDir: '',
      getFileFilter,
      getParser: FileIRParser.getParser,
      getSchema: () => {},
      filepaths: null,
    },
  }

  writerConfigs = {
    default: {
      getWriter: (...any: any) => {},
      isGeneratedFile: (filePath: string) =>
        filePath.endsWith('.js') && filePath.includes('__generated__'),
      parser: 'default',
    },
  }

  reporter = {}

  constructor (options: {
    schema: string,
    src: string,
    extensions: Array<string>,
    include: Array<String>,
    exclude: Array<String>,
    reporter: {reportError: (area: string, error: string) => void},
  }) {
    if (!options) {
      throw new Error('You must provide options to RelayCompilerWebpackPlugin.')
    }

    if (!options.schema) {
      throw new Error('You must provide a Relay Schema path.')
    }

    if (!fs.existsSync(options.schema)) {
      throw new Error('Could not find the Schema. Have you provided a fully resolved path?')
    }

    if (!options.src) {
      throw new Error('You must provide a Relay `src` path.')
    }

    if (!fs.existsSync(options.src)) {
      throw new Error('Could not find your `src` path. Have you provided a fully resolved path?')
    }

    const extensions = options.extensions !== undefined ? options.extensions : [ 'js' ]
    const include = options.include !== undefined ? options.include : [ '**' ]
    const exclude = options.exclude !== undefined ? options.exclude : [
      '**/node_modules/**',
      '**/__mocks__/**',
      '**/__tests__/**',
      '**/__generated__/**',
    ]

    const fileOptions = {
      extensions,
      include,
      exclude,
    }

    this.parserConfigs.default.baseDir = options.src
    this.parserConfigs.default.schema = options.schema
    this.parserConfigs.default.getSchema = () => getSchema(options.schema)
    this.parserConfigs.default.filepaths = getFilepathsFromGlob(options.src, fileOptions)

    this.writerConfigs.default.getWriter = getWriter(options.src)

    this.reporter = options.reporter ? options.reporter : new ConsoleReporter({ verbose: false });
  }

  apply (compiler: Compiler) {
    compiler.plugin('before-compile', async (compilationParams, callback) => {
      try {
        const runner = new Runner({
          parserConfigs: this.parserConfigs,
          writerConfigs: this.writerConfigs,
          reporter: this.reporter,
          onlyValidate: false,
          skipPersist: true,
        })

        await runner.compileAll()
      } catch (error) {
        callback(error)
        return
      }
      callback()
    })
  }
}

module.exports = RelayCompilerWebpackPlugin
