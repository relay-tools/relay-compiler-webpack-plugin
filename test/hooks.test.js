/* global jest, describe, it, beforeEach */
/* eslint-env jest */
import webpack from 'webpack'
import path from 'path'
import rimraf from 'rimraf'
import RelayCompilerWebpackPlugin from '../src/index'
import normaliseConfigForWebpackVersion from './support/normaliseConfigForWebpackVersion'
import createTempFixtureProject from './support/createTempFixtureProject'
import { removeSync } from 'fs-extra'

jest.setTimeout(30000)

const DEFAULT_NODE_ENV = process.env.NODE_ENV

describe('RelayCompilerWebpackPlugin', () => {
  let fixtureDir
  let createWebpackConfig
  let srcDir

  beforeEach(() => {
    process.env.NODE_ENV = DEFAULT_NODE_ENV
    fixtureDir = createTempFixtureProject('hooks')
    createWebpackConfig = require(fixtureDir + '/createWebpackConfig')
    srcDir = path.join(fixtureDir, 'src')
  })

  afterEach(() => {
    removeSync(fixtureDir)
  })

  it('Calls hooks appropriately', done => {
    const beforeWriteSpy = jest.fn()
    const afterWriteSpy = jest.fn()
    const relayCompilerWebpackPlugin = new RelayCompilerWebpackPlugin({
      schema: path.resolve(fixtureDir, 'schema.json'),
      src: srcDir
    })

    const plugin = {
      apply (compiler) {
        const setUpHooks = (compilation) => {
          const hooks = RelayCompilerWebpackPlugin.getHooks(compilation)
          hooks.beforeWrite.tapPromise('test-hooks', async () => {
            beforeWriteSpy()
          })

          hooks.afterWrite.tapPromise('test-hooks', async (result) => {
            afterWriteSpy(result)
          })
        }

        if (compiler.hooks) {
          compiler.hooks.compilation.tap('TestHooksPlugin', setUpHooks)
        } else {
          compiler.plugin('compilation', setUpHooks)
        }
      }
    }

    const webpackConfig = normaliseConfigForWebpackVersion(
      createWebpackConfig({
        relayCompilerWebpackPlugin,
        plugins: [plugin]
      })
    )

    webpack(webpackConfig, (err, stats) => {
      expect(err).toBeFalsy()
      expect(stats.compilation.errors).toHaveLength(0)
      expect(stats.compilation.warnings).toHaveLength(0)

      expect(beforeWriteSpy).toHaveBeenCalledTimes(1)
      expect(afterWriteSpy).toHaveBeenCalledTimes(1)
      expect(afterWriteSpy).toHaveBeenCalledWith('HAS_CHANGES')
      done()
    })
  })
})
