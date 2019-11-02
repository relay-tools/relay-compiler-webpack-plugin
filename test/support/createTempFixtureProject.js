import { copySync, removeSync } from 'fs-extra'
import path from "path"

export default function(name) {
  const normalCaseDir = path.resolve(__dirname, '..', 'fixtureProject')
  const tempDir = path.resolve(__dirname, '..', 'temp', name)
  removeSync(tempDir)
  copySync(normalCaseDir, tempDir)
  return tempDir
}
