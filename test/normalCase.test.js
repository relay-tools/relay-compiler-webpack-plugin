/* global jest, describe, it, beforeEach */
/* eslint-env jest */
import webpack from 'webpack'
import fs from 'fs'
import path from 'path'
import rimraf from 'rimraf'
import RelayCompilerWebpackPlugin from '../src/index'
import createWebpackConfig from './fixtures/normalCase/createWebpackConfig'

jest.setTimeout(30000)

describe('RelayCompilerWebpackPlugin', () => {
  const srcDir = path.resolve(__dirname, 'fixtures', 'normalCase', 'src')

  beforeEach(done => {
    rimraf(srcDir + '/**/__generated__/**', done)
  })

  it('generates graphql files correctly for a normal example', done => {
    const webpackConfig = createWebpackConfig(RelayCompilerWebpackPlugin)

    webpack(webpackConfig, (err, stats) => {
      expect(err).toBeFalsy()
      expect(stats.compilation.errors).toHaveLength(0)
      expect(stats.compilation.warnings).toHaveLength(0)

      const expectedFiles = [
        path.resolve(srcDir, 'mutations', '__generated__', 'updateFirstNameMutation.graphql.js'),
        path.resolve(srcDir, 'components', '__generated__', 'HomeItem_person.graphql.js'),
        path.resolve(srcDir, 'components', '__generated__', 'Home_people.graphql.js'),
        path.resolve(srcDir, 'components', '__generated__', 'AppQuery.graphql.js'),
        path.resolve(srcDir, 'components', '__generated__', 'AboutQuery.graphql.js')
      ]
      expectedFiles.forEach(generatedFilepath => {
        expect(fs.existsSync(generatedFilepath)).toBe(true)
        expect(fs.readFileSync(generatedFilepath, 'utf8')).toMatchSnapshot()
      })

      done()
    })
  })
})
