// @flow

import type { WriteFilesOptions } from 'relay-compiler'
import { FileWriter, IRTransforms } from 'relay-compiler/lib'

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
} = IRTransforms

export default (languagePlugin: any, config: WriterConfig) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter
}: WriteFilesOptions) =>
  FileWriter.writeAll({
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
