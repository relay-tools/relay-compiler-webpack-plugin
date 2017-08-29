// @flow

import fs from 'fs'
import path from 'path'

type File = {
  relPath: string,
  hash: string,
};

export default function getFileFilter (baseDir: string) {
  return (file: File) => {
    const fullPath = path.join(baseDir, file.relPath)
    const stats = fs.statSync(fullPath)

    if (stats.isFile()) {
      const text = fs.readFileSync(fullPath, 'utf8')
      return text.includes('graphql')
    }

    return false
  }
}
