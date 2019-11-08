// @flow

import fs from 'fs';
import { buildClientSchema, printSchema, Source } from 'graphql';
import path from 'path';

// Taken from relay-compiler/bin/RelayCompilerMain.js
export default function getSchemaSource(schemaPath: string): Source {
  let source = fs.readFileSync(schemaPath, 'utf8');
  if (path.extname(schemaPath) === '.json') {
    source = printSchema(buildClientSchema(JSON.parse(source).data));
  }
  source = `
  directive @include(if: Boolean) on FRAGMENT_SPREAD | FIELD
  directive @skip(if: Boolean) on FRAGMENT_SPREAD | FIELD

  ${source}
  `;
  return new Source(source, schemaPath);
}
