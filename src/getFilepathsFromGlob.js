export default function getFilepathsFromGlob (
  baseDir,
  options: {
    extensions: Array<string>,
    include: Array<string>,
    exclude: Array<string>
  }
): Array<string> {
  const { extensions, include, exclude } = options
  const patterns = include.map(inc => `${inc}/*.+(${extensions.join('|')})`)

  // $FlowFixMe(site=react_native_fb,www)
  const glob = require('fast-glob')
  return glob.sync(patterns, {
    cwd: baseDir,
    bashNative: [],
    onlyFiles: true,
    ignore: exclude
  })
}
