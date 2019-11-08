# Relay Compiler Webpack Plugin

[![npm version](https://badge.fury.io/js/relay-compiler-webpack-plugin.svg)](https://badge.fury.io/js/relay-compiler-webpack-plugin)
[![Build Status](https://travis-ci.org/danielholmes/relay-compiler-webpack-plugin.svg?branch=master)](https://travis-ci.org/danielholmes/relay-compiler-webpack-plugin)

Are you running Relay Modern? Are you annoyed with constantly running the `relay-compiler` to generate code, especially
if you're already running Webpack?

Well be annoyed no more! Simply install this plugin to automatically hook into Webpack's build process to generate these
files for you.


## Installation

  1. Add this to your project:

```sh
  yarn add --dev relay-compiler-webpack-plugin
  # Or if you're using npm
  npm install --save-dev relay-compiler-webpack-plugin
```

  2. Add the plugin to your Webpack configuration:

```javascript
const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin')
const path = require('path')

module.exports = {
  // ... Your existing Webpack configuration
  plugins: [
    // ...
    new RelayCompilerWebpackPlugin({
      schema: path.resolve(__dirname, './relative/path/to/schema.graphql'), // or schema.json
      src: path.resolve(__dirname, './relative/path/to/source/files'),
    })
  ]
  // ...
}
```

  3. :tada:


### Gotchas

If there are multiple versions of GraphQL in your dependency tree it will cause schema validation errors. To get around
this, ensure you have the same graphql version as your relay-compiler version depends on. To assist this you can
[install dependencies as flat](https://yarnpkg.com/lang/en/docs/cli/install/#toc-yarn-install-flat) which ensures only
one version of each dependency.


### Plugin hooks

`relay-compiler-webpack-plugin` exposes a few [tapable](https://github.com/webpack/tapable/tree/master) hooks, for plugins or tooling to use.

- `beforeWrite` called before the plugin starts to compile queries
- `afterWrite(compileResult)`: called after writing is complete

```js
class MyPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('MyPlugin', async (compilation) => {
      RelayCompilerWebpackPlugin.getHooks(compilation).afterWrite.tapPromise(
        'MyPlugin', // <-- Set a meaningful name for stacktraces
        async (compileResult) => {
          if (compileResult === 'HAS_CHANGES') {
            await doSomething()
          }
        }
      )
    })
  }
}
```

## Example Project

To see an example of its usage within a project, see
[relay-compiler-webpack-plugin-example](https://github.com/danielholmes/relay-compiler-webpack-plugin-example).


## Development

Running tests:

```bash
yarn test
```

Running tests with coverage:

```bash
yarn test:coverage
```


## License

Relay Compiler Webpack Plugin may be redistributed according to the [BSD 3-Clause License](LICENSE).

Copyright 2019
