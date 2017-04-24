// @flow

import { buildASTSchema, parse } from 'graphql'
import fs from 'fs'

import type { GraphQLSchema } from 'graphql'

export default function getSchema (schemaPath: string): GraphQLSchema {
  try {
    let source = fs.readFileSync(schemaPath, 'utf8')
    source = `
      directive @include(if: Boolean) on FRAGMENT | FIELD
      directive @skip(if: Boolean) on FRAGMENT | FIELD
      directive @relay(pattern: Boolean, plural: Boolean) on FRAGMENT | FIELD
      ${source}
    `
    return buildASTSchema(parse(source))
  } catch (error) {
    throw new Error(`
Error loading schema. Expected the schema to be a .graphql file using the
GraphQL schema definition language. Error detail:

${error.stack}
    `.trim())
  }
}
