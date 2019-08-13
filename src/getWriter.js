// @flow

import type { WriteFilesOptions } from 'relay-compiler'
import RelayFileWriter from 'relay-compiler/lib/RelayFileWriter'
import RelayIRTransforms from 'relay-compiler/lib/RelayIRTransforms'

export type WriterConfig = {
  outputDir?: string,
  baseDir: string
}

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions
} = RelayIRTransforms

export default (languagePlugin: any, config: WriterConfig) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter
}: WriteFilesOptions) =>
  RelayFileWriter.writeAll({
    config: {
      customScalars: {},
      ...config,
      compilerTransforms: {
        commonTransforms,
        codegenTransforms,
        fragmentTransforms,
        printTransforms,
        queryTransforms
      },
      formatModule: languagePlugin.formatModule,
      optionalInputFieldsForFlow: [],
      schemaExtensions,
      useHaste: false,
      extension: languagePlugin.outputExtension,
      typeGenerator: languagePlugin.typeGenerator
    },
    onlyValidate,
    schema,
    baseDocuments,
    documents,
    reporter,
    sourceControl
  })
