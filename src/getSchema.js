// @flow

import {
  printSchema,
  buildClientSchema,
  buildASTSchema,
  parse
} from 'graphql'
import fs from 'fs'
import path from 'path'

import type { GraphQLSchema } from 'graphql'

export default function getSchema(schemaPath: string): GraphQLSchema {
  try {
    let source = fs.readFileSync(schemaPath, 'utf8')
    if (path.extname(schemaPath) === '.json') {
      source = printSchema(buildClientSchema(JSON.parse(source).data))
    }
    source = `
  directive @include(if: Boolean) on FRAGMENT | FIELD
  directive @skip(if: Boolean) on FRAGMENT | FIELD
  directive @relay(pattern: Boolean, plural: Boolean) on FRAGMENT | FIELD
  ${source}
  `

    return buildASTSchema(parse(source))
  } catch (error) {
    throw new Error(`
Error loading schema. Expected the schema to be a .graphql or a .json
file, describing your GraphQL server's API. Error detail:
${error.stack}
    `.trim())
  }
}
