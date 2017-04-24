// @flow

import { FileWriter, IRTransforms } from 'relay-compiler'
import type { Map } from 'immutable'
import type { GraphQLSchema } from 'graphql'

const {
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaTransforms,
} = IRTransforms

export default function getWriter (baseDir: string) {
  return (onlyValidate: boolean, schema: GraphQLSchema, documents: Map<string, Object>, baseDocuments: Map<string, Object>) => {
    return new FileWriter({
      config: {
        buildCommand: 'relay-compiler-webpack-plugin',
        compilerTransforms: {
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms,
        },
        baseDir,
        schemaTransforms,
      },
      onlyValidate,
      schema,
      baseDocuments,
      documents,
    })
  }
}
