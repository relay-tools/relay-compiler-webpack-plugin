import { FileWriter, IRTransforms } from 'relay-compiler'
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

export default function getWriter (
  languagePlugin: any,
  baseDir: string,
  outputDir: ?string
) {
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
        extension: languagePlugin.outputExtension,
        formatModule: languagePlugin.formatModule,
        inputFieldWhiteListForFlow: [],
        outputDir,
        schemaExtensions,
        typeGenerator: languagePlugin.typeGenerator,
        useHaste: false
      }
    })
  }
}
