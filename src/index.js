// @flow

import { Runner, FileIRParser, ConsoleReporter } from 'relay-compiler'
import fs from 'fs'

import getSchema from './getSchema'
import getFileFilter from './getFileFilter'
import getWriter from './getWriter'
import buildWatchmanExpression from './buildWatchmanExpression'
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
      watchmanExpression: null,
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
    watchman: boolean,
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

    const watchman = options.watchman !== undefined ? options.watchman : true
    const fileOptions = {
      extensions: [ 'js' ],
      include: [ '**' ],
      exclude: [
        '**/node_modules/**',
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/__generated__/**',
      ],
    }

    this.parserConfigs.default.baseDir = options.src
    this.parserConfigs.default.schema = options.schema
    this.parserConfigs.default.getSchema = () => getSchema(options.schema)
    this.parserConfigs.default.watchmanExpression = options.watchman ? buildWatchmanExpression(fileOptions) : null
    this.parserConfigs.default.filepaths = options.watchman ? null : getFilepathsFromGlob(options.src, fileOptions)

    this.writerConfigs.default.getWriter = getWriter(options.src)

    this.reporter = new ConsoleReporter({ verbose: false });
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
