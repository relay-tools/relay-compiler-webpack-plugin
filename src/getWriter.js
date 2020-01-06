// @flow

import { FileWriter, IRTransforms } from 'relay-compiler';
import type { WriteFilesOptions } from 'relay-compiler';

export type WriterConfig = {
  outputDir?: string,
  baseDir: string,
  customScalars?: any
}

const {
  commonTransforms,
  codegenTransforms,
  fragmentTransforms,
  printTransforms,
  queryTransforms,
  schemaExtensions,
} = IRTransforms;

// Taken from relay-compiler/bin/RelayCompilerMain.js
export default (languagePlugin: any, config: WriterConfig) => ({
  onlyValidate,
  schema,
  documents,
  baseDocuments,
  sourceControl,
  reporter,
}: WriteFilesOptions) => FileWriter.writeAll({
  config: {
    customScalars: {},
    ...config,
    compilerTransforms: {
      commonTransforms,
      codegenTransforms,
      fragmentTransforms,
      printTransforms,
      queryTransforms,
    },
    formatModule: languagePlugin.formatModule,
    optionalInputFieldsForFlow: [],
    schemaExtensions,
    useHaste: false,
    extension: languagePlugin.outputExtension,
    typeGenerator: languagePlugin.typeGenerator,
  },
  onlyValidate,
  schema,
  baseDocuments,
  documents,
  reporter,
  sourceControl,
});
