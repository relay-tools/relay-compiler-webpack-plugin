import {
  printSchema, buildClientSchema, Source,
} from 'graphql';
import fs from 'fs';
import path from 'path';

// From https://github.com/facebook/relay/blob/master/packages/relay-compiler/bin/RelayCompilerMain.js
export default function getSchemaSource(schemaPath: string): Source {
  let source = fs.readFileSync(schemaPath, 'utf8');
  if (path.extname(schemaPath) === '.json') {
    source = printSchema(buildClientSchema(JSON.parse(source).data));
  }
  source = `
  directive @include(if: Boolean) on FRAGMENT_SPREAD | FIELD | INLINE_FRAGMENT
  directive @skip(if: Boolean) on FRAGMENT_SPREAD | FIELD | INLINE_FRAGMENT
  ${source}
  `;
  return new Source(source, schemaPath);
}
