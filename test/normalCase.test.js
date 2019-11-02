/* global jest, describe, it, beforeEach */
/* eslint-env jest */
import webpack from 'webpack'
import fs from 'fs'
import path from 'path'
import RelayCompilerWebpackPlugin from '../src/index'
import normaliseConfigForWebpackVersion from './support/normaliseConfigForWebpackVersion'
import createTempFixtureProject from './support/createTempFixtureProject'
import { removeSync } from 'fs-extra'

// TODO: Move to jest setupTests or something like that
jest.setTimeout(30000)

const DEFAULT_NODE_ENV = process.env.NODE_ENV

describe('RelayCompilerWebpackPlugin', () => {
  let fixtureDir
  let createWebpackConfig

  beforeEach(() => {
    process.env.NODE_ENV = DEFAULT_NODE_ENV
    fixtureDir = createTempFixtureProject('normalCase')
    createWebpackConfig = require(fixtureDir + '/createWebpackConfig')
  })

  afterEach(() => {
    process.env.NODE_ENV = DEFAULT_NODE_ENV
    removeSync(fixtureDir)
  })

  it('generates graphql files correctly for a normal example', done => {
    const relayCompilerWebpackPlugin = new RelayCompilerWebpackPlugin({
      schema: path.resolve(fixtureDir, 'schema.json'),
      src: path.resolve(fixtureDir, 'src')
    })

    const webpackConfig = normaliseConfigForWebpackVersion(
      createWebpackConfig({ relayCompilerWebpackPlugin })
    )

    webpack(webpackConfig, (err, stats) => {
      expect(err).toBeFalsy()
      expect(stats.compilation.errors).toHaveLength(0)
      expect(stats.compilation.warnings).toHaveLength(0)

      const expectedFiles = [
        path.join(
          'mutations',
          '__generated__',
          'updateFirstNameMutation.graphql.js'
        ),
        path.join(
          'components',
          '__generated__',
          'HomeItem_person.graphql.js'
        ),
        path.join(
          'components',
          '__generated__',
          'Home_people.graphql.js'
        ),
        path.join(
          'components',
          '__generated__',
          'AppQuery.graphql.js'
        ),
        path.join(
          'components',
          '__generated__',
          'AboutQuery.graphql.js'
        )
      ]
      expectedFiles.forEach(generatedSrcPath => {
        const absPath = path.resolve(fixtureDir, 'src', generatedSrcPath)
        expect(fs.existsSync(absPath)).toBe(true)
        expect(fs.readFileSync(absPath, 'utf8')).toMatchSnapshot()
      })

      done()
    })
  })

  it('generates graphql files correctly for a normal example with --artifactDirectory option', done => {
    const relayCompilerWebpackPlugin = new RelayCompilerWebpackPlugin({
      schema: path.resolve(fixtureDir, 'schema.json'),
      src: path.resolve(fixtureDir, 'src'),
      artifactDirectory: path.resolve(fixtureDir, 'src', '__generated__')
    })

    const webpackConfig = normaliseConfigForWebpackVersion(
      createWebpackConfig({ relayCompilerWebpackPlugin })
    )

    process.env.NODE_ENV = 'artifactDirectoryTest'
    webpack(webpackConfig, (err, stats) => {
      expect(err).toBeFalsy()
      if (stats.compilation.logging) {
        expect(stats.compilation.logging.get('RelayCompilerPlugin')).toHaveLength(2)
      }

      expect(stats.compilation.errors).toHaveLength(0)
      expect(stats.compilation.warnings).toHaveLength(0)

      const expectedFiles = [
        'updateFirstNameMutation.graphql.js',
        'HomeItem_person.graphql.js',
        'Home_people.graphql.js',
        'AppQuery.graphql.js',
        'AboutQuery.graphql.js'
      ]
      expectedFiles.forEach(fileName => {
        const generatedFilepath = path.resolve(
          fixtureDir, 'src', '__generated__', fileName
        )
        expect(fs.existsSync(generatedFilepath)).toBe(true)
        expect(fs.readFileSync(generatedFilepath, 'utf8')).toMatchSnapshot()
      })

      done()
    })
  })
})
