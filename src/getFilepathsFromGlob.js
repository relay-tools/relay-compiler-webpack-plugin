import glob from 'fast-glob'

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

  return glob.sync(patterns, {
    cwd: baseDir,
    bashNative: [],
    onlyFiles: true,
    dot: true, // match behavior of watchman from relay-compiler
    ignore: exclude
  })
}
