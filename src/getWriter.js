import { FileWriter, IRTransforms } from 'relay-compiler'
import formatGeneratedModule from 'relay-compiler/lib/formatGeneratedModule'
import RelayFlowGenerator from 'relay-compiler/lib/RelayFlowGenerator'
import type { Map } from 'immutable'
import type { GraphQLSchema } from 'graphql'

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions
} = IRTransforms

interface WriterConfig {
  onlyValidate: boolean;
  schema: GraphQLSchema;
  documents: Map<string, Object>;
  baseDocuments: Map<string, Object>;
  sourceControl: any;
  reporter: any;
}

export default function getWriter (baseDir: string) {
  return (config: WriterConfig | boolean, ...args) => {
    const cfg =
      typeof config === 'object'
        ? config
        : {
          onlyValidate: config,
          schema: args[0],
          documents: args[1],
          baseDocuments: args[2],
          sourceControl: args[3],
          reporter: args[4]
        }
    return new FileWriter({
      ...cfg,
      config: {
        baseDir,
        compilerTransforms: {
          commonTransforms,
          codegenTransforms,
          fragmentTransforms,
          printTransforms,
          queryTransforms
        },
        customScalars: {},
        formatModule: formatGeneratedModule,
        inputFieldWhiteListForFlow: [],
        schemaExtensions,
        extension: 'js',
        typeGenerator: RelayFlowGenerator,
        useHaste: false
      }
    })
  }
}
