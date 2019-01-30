/* global jest, describe, it, beforeEach */
/* eslint-env jest */
import path from 'path'
import RelayCompilerWebpackPlugin from '../src/index'
import normaliseConfigForWebpackVersion from './support/normaliseConfigForWebpackVersion'
import createWebpackConfig from './fixtures/normalCase/createWebpackConfig'
import webpack from 'webpack'

jest.setTimeout(20000)

describe('RelayCompilerWebpackPlugin', () => {
  it('throws if an empty constructor', () => {
    expect(() => new RelayCompilerWebpackPlugin()).toThrow(
      'You must provide options to RelayCompilerWebpackPlugin.'
    )
  })

  it("throws if the schema isn't found", () => {
    const fixtureDir = path.join(__dirname, 'fixtures', 'normalCase')
    const src = path.join(fixtureDir, 'src')
    const schema = path.join(fixtureDir, 'schema-doesnt-exist.json')

    expect(() => new RelayCompilerWebpackPlugin({ schema, src })).toThrow(
      `Could not find the [schema] provided (${schema})`
    )
  })

  it('throws if no schema provided', () => {
    const src = path.join(__dirname, 'fixtures', 'normalCase', 'src')

    expect(() => new RelayCompilerWebpackPlugin({ src })).toThrow(
      'You must provide a Relay Schema.'
    )
  })

  it('throws if invalid schema provided', done => {
    const webpackConfig = normaliseConfigForWebpackVersion(
      createWebpackConfig({ RelayCompilerWebpackPlugin })
    )
    const fixtureDir = path.resolve(__dirname, 'fixtures', 'normalCase')
    webpackConfig.plugins = [
      new RelayCompilerWebpackPlugin({
        src: path.resolve(fixtureDir, 'src'),
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
    const schema = path.join(__dirname, 'fixtures', 'normalCase', 'schema.json')

    expect(() => new RelayCompilerWebpackPlugin({ schema })).toThrow(
      'You must provide a Relay `src` path.'
    )
  })

  it("throws if source isn't found", () => {
    const fixtureDir = path.join(__dirname, 'fixtures', 'normalCase')
    const src = path.join(fixtureDir, 'src-doesnt-exist')
    const schema = path.join(fixtureDir, 'schema.json')

    expect(() => new RelayCompilerWebpackPlugin({ src, schema })).toThrow(
      `Could not find the [src] provided (${src})`
    )
  })
})
