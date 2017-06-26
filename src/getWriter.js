// @flow

import { FileWriter, IRTransforms } from 'relay-compiler'
import formatGeneratedModule from 'relay-compiler/lib/formatGeneratedModule'
import type { Map } from 'immutable'
import type { GraphQLSchema } from 'graphql'

const {
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions,
} = IRTransforms

export default function getWriter (baseDir: string) {
  return (onlyValidate: boolean, schema: GraphQLSchema, documents: Map<string, Object>, baseDocuments: Map<string, Object>) => {
    return new FileWriter({
      config: {
        buildCommand: 'relay-compiler-webpack-plugin',
        formatModule: formatGeneratedModule,
        compilerTransforms: {
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms,
        },
        baseDir,
        schemaExtensions,
      },
      onlyValidate,
      schema,
      baseDocuments,
      documents,
    })
  }
}
