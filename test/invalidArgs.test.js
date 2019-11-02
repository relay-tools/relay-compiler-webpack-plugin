/* global jest, describe, it, beforeEach */
/* eslint-env jest */
import path from 'path'
import RelayCompilerWebpackPlugin from '../src/index'
import normaliseConfigForWebpackVersion from './support/normaliseConfigForWebpackVersion'
import webpack from 'webpack'
import createTempFixtureProject from './support/createTempFixtureProject'
import { removeSync } from 'fs-extra'

jest.setTimeout(20000)

describe('RelayCompilerWebpackPlugin', () => {
  let fixtureDir
  let createWebpackConfig
  let srcDir

  beforeEach(() => {
    fixtureDir = createTempFixtureProject('invalidArgs')
    createWebpackConfig = require(fixtureDir + '/createWebpackConfig')
    srcDir = path.join(fixtureDir, 'src')
  })

  afterEach(() => {
    removeSync(fixtureDir)
  })

  it('throws if an empty constructor', () => {
    expect(() => new RelayCompilerWebpackPlugin()).toThrow(
      'You must provide options to RelayCompilerWebpackPlugin.'
    )
  })

  it("throws if the schema isn't found", () => {
    const schema = path.join(fixtureDir, 'schema-doesnt-exist.json')

    expect(() => new RelayCompilerWebpackPlugin({ schema, src: srcDir })).toThrow(
      `Could not find the [schema] provided (${schema})`
    )
  })

  it('throws if no schema provided', () => {
    expect(() => new RelayCompilerWebpackPlugin({ src: srcDir })).toThrow(
      'You must provide a Relay Schema.'
    )
  })

  it('throws if invalid schema provided', done => {
    const webpackConfig = normaliseConfigForWebpackVersion(
      createWebpackConfig({ RelayCompilerWebpackPlugin })
    )
    webpackConfig.plugins = [
      new RelayCompilerWebpackPlugin({
        src: srcDir,
        schema: path.resolve(__dirname, '..', 'package.json')
      })
    ]

    webpack(webpackConfig, (err, stats) => {
      expect(err).toBeFalsy()
      expect(stats.compilation.errors).toHaveLength(5)
      expect(stats.compilation.warnings).toHaveLength(0)
      stats.compilation.errors
        .map(e => e.message)
        .forEach(message =>
          expect(message).toEqual(
            expect.stringContaining(
              'Error loading schema. Expected the schema to be a .graphql or a .json'
            )
          )
        )
      done()
    })
  })

  it('throws if no src provided', () => {
    const schema = path.join(fixtureDir, 'schema.json')

    expect(() => new RelayCompilerWebpackPlugin({ schema })).toThrow(
      'You must provide a Relay `src` path.'
    )
  })

  it("throws if source isn't found", () => {
    const src = path.join(fixtureDir, 'src-doesnt-exist')
    const schema = path.join(fixtureDir, 'schema.json')

    expect(() => new RelayCompilerWebpackPlugin({ src, schema })).toThrow(
      `Could not find the [src] provided (${src})`
    )
  })
})
