// @flow

import type { WriteFilesOptions } from 'graphql-compiler'
import RelayFileWriter from 'relay-compiler/lib/RelayFileWriter'
import RelayIRTransforms from 'relay-compiler/lib/RelayIRTransforms'

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions
} = RelayIRTransforms

export default (
  baseDir: string,
  languagePlugin: any,
  noFutureProofEnums: boolean,
  outputDir: ?string
) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter
}: WriteFilesOptions) =>
  RelayFileWriter.writeAll({
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
      formatModule: languagePlugin.formatModule,
      optionalInputFieldsForFlow: [],
      schemaExtensions,
      useHaste: false,
      noFutureProofEnums,
      extension: languagePlugin.outputExtension,
      typeGenerator: languagePlugin.typeGenerator,
      outputDir
    },
    onlyValidate,
    schema,
    baseDocuments,
    documents,
    reporter,
    sourceControl
  })
