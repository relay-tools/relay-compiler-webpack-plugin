// @flow

import fs from 'fs'
import path from 'path'

export default function getFileFilter (baseDir: string) {
  return (filename: string) => {
    const fullPath = path.join(baseDir, filename)
    const stats = fs.statSync(fullPath)

    if (stats.isFile()) {
      const text = fs.readFileSync(fullPath, 'utf8')
      return text.includes('graphql')
    }

    return false
  }
}
