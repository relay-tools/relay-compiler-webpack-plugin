/* global jest, describe, it, beforeEach */
/* eslint-env jest */
import webpack from 'webpack'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import RelayCompilerWebpackPlugin from '../src/index'
import createWebpackConfig from './fixtures/normalCase/createWebpackConfig'
import normaliseConfigForWebpackVersion from './support/normaliseConfigForWebpackVersion'

jest.setTimeout(30000)

const DEFAULT_NODE_ENV = process.env.NODE_ENV

describe('RelayCompilerWebpackPlugin', () => {
  const srcDir = path.resolve(__dirname, 'fixtures', 'normalCase', 'src')

  beforeEach(done => {
    rimraf(srcDir + '/**/__generated__/**', done)
     process.env.NODE_ENV = DEFAULT_NODE_ENV
  })

  it('generates graphql files correctly for a normal example', done => {
    const normalCaseDir = path.resolve(__dirname, 'fixtures', 'normalCase');
    const relayCompilerWebpackPlugin = new RelayCompilerWebpackPlugin({
      schema: path.resolve(normalCaseDir, 'schema.json'),
      src: path.resolve(normalCaseDir, 'src'),
    })

    const webpackConfig = normaliseConfigForWebpackVersion(
      createWebpackConfig({relayCompilerWebpackPlugin})
    )

    webpack(webpackConfig, (err, stats) => {
      expect(err).toBeFalsy()
      expect(stats.compilation.errors).toHaveLength(0)
      expect(stats.compilation.warnings).toHaveLength(0)

      const expectedFiles = [
        path.resolve(
          srcDir,
          'mutations',
          '__generated__',
          'updateFirstNameMutation.graphql.js'
        ),
        path.resolve(
          srcDir,
          'components',
          '__generated__',
          'HomeItem_person.graphql.js'
        ),
        path.resolve(
          srcDir,
          'components',
          '__generated__',
          'Home_people.graphql.js'
        ),
        path.resolve(
          srcDir,
          'components',
          '__generated__',
          'AppQuery.graphql.js'
        ),
        path.resolve(
          srcDir,
          'components',
          '__generated__',
          'AboutQuery.graphql.js'
        )
      ]
      expectedFiles.forEach(generatedFilepath => {
        expect(fs.existsSync(generatedFilepath)).toBe(true)
        expect(fs.readFileSync(generatedFilepath, 'utf8')).toMatchSnapshot()
      })

      done()
    })
  })

  it('generates graphql files correctly for a normal example with --artifactDirectory option', done => {
    process.env.NODE_ENV = "artifactDirectoryTest";

    const normalCaseDir = path.resolve(__dirname, 'fixtures', 'normalCase');
    const relayCompilerWebpackPlugin = new RelayCompilerWebpackPlugin({
      schema: path.resolve(normalCaseDir, 'schema.json'),
      src: path.resolve(normalCaseDir, 'src'),
      artifactDirectory: path.resolve(normalCaseDir, 'src', '__generated__'),
    })

    const webpackConfig = normaliseConfigForWebpackVersion(
      createWebpackConfig({relayCompilerWebpackPlugin})
    );

    webpack(webpackConfig, (err, stats) => {
      expect(err).toBeFalsy()
      expect(stats.compilation.errors).toHaveLength(0)
      expect(stats.compilation.warnings).toHaveLength(0)

      const expectedFiles = [
        path.resolve(
          srcDir,
          '__generated__',
          'updateFirstNameMutation.graphql.js'
        ),
        path.resolve(
          srcDir,
          '__generated__',
          'HomeItem_person.graphql.js'
        ),
        path.resolve(
          srcDir,
          '__generated__',
          'Home_people.graphql.js'
        ),
        path.resolve(
          srcDir,
          '__generated__',
          'AppQuery.graphql.js'
        ),
        path.resolve(
          srcDir,
          '__generated__',
          'AboutQuery.graphql.js'
        )
      ]
      expectedFiles.forEach(generatedFilepath => {
        expect(fs.existsSync(generatedFilepath)).toBe(true)
        expect(fs.readFileSync(generatedFilepath, 'utf8')).toMatchSnapshot()
      })

      done()
    })
  })
})
