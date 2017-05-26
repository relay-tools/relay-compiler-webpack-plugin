// @flow

import { Runner, FileIRParser } from 'relay-compiler'
import fs from 'fs'

import getSchema from './getSchema'
import getFileFilter from './getFileFilter'
import getWriter from './getWriter'

import type { Compiler } from 'webpack'

class RelayCompilerWebpackPlugin {
  parserConfigs = {
    default: {
      schema: '',
      baseDir: '',
      getFileFilter,
      getParser: FileIRParser.getParser,
      getSchema: () => {},
    },
  }

  writerConfigs = {
    default: {
      getWriter: (...any: any) => {},
      parser: 'default',
    },
  }

  constructor (options: {
    schema: string,
    src: string,
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

    this.parserConfigs.default.baseDir = options.src
    this.parserConfigs.default.schema = options.schema
    this.parserConfigs.default.getSchema = () => getSchema(options.schema)

    this.writerConfigs.default.getWriter = getWriter(options.src)
  }

  apply (compiler: Compiler) {
    compiler.plugin('before-compile', async (compilation, callback) => {
      try {
        const runner = new Runner({
          parserConfigs: this.parserConfigs,
          writerConfigs: this.writerConfigs,
          onlyValidate: false,
          skipPersist: true,
        })

        await runner.compileAll()
      } catch (error) {
        compilation.errors.push(error)
      } finally {
        callback()
      }
    })
  }
}

module.exports = RelayCompilerWebpackPlugin
