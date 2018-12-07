/* global require */

const webpackMajorVersion = Number(require('webpack/package.json').version.split('.')[0])

if (isNaN(webpackMajorVersion)) {
  throw new Error('Cannot parse webpack major version');
}

export default config => {
  if (webpackMajorVersion < 4) {
    delete config.mode
  }
  return config
}
