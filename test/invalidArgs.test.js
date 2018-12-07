/* global jest, describe, it, beforeEach */
/* eslint-env jest */
import path from 'path'
import RelayCompilerWebpackPlugin from '../src/index'


describe('RelayCompilerWebpackPlugin', () => {
  it('throws if an empty constructor', () => {
    expect(
      () => new RelayCompilerWebpackPlugin()
    ).toThrow('You must provide options to RelayCompilerWebpackPlugin.')
  })

  it('throws if the schema isn\'t found', () => {
    const fixtureDir = path.join(__dirname, 'fixtures', 'normalCase')
    const src = path.join(fixtureDir, 'src')
    const schema = path.join(fixtureDir, 'schema-doesnt-exist.json')

    expect(
      () => new RelayCompilerWebpackPlugin({ schema, src })
    ).toThrow(`Could not find the [schema] provided (${schema})`)
  })

  it('throws if no schema provided', () => {
    const src = path.join(__dirname, 'fixtures', 'normalCase', 'src')

    expect(
      () => new RelayCompilerWebpackPlugin({ src })
    ).toThrow('You must provide a Relay Schema.')
  })

  it('throws if no src provided', () => {
    const schema = path.join(__dirname, 'fixtures', 'normalCase', 'schema.json')

    expect(
      () => new RelayCompilerWebpackPlugin({ schema })
    ).toThrow('You must provide a Relay `src` path.')
  })

  it('throws if source isn\'t found', () => {
    const fixtureDir = path.join(__dirname, 'fixtures', 'normalCase')
    const src = path.join(fixtureDir, 'src-doesnt-exist')
    const schema = path.join(fixtureDir, 'schema.json')

    expect(
      () => new RelayCompilerWebpackPlugin({ src, schema })
    ).toThrow(`Could not find the [src] provided (${src})`)
  })
})
