const path = require('path')

module.exports = ({ relayCompilerWebpackPlugin, plugins = [] }) => {
  console.log('createWebpackConfig', __dirname)
  return ({
    mode: 'production',
    context: __dirname,
    entry: './src/entry.js',
    output: {
      path: path.resolve('dist'),
      filename: 'index.js'
    },
    performance: {
      hints: false
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: path.join(__dirname, 'node_modules'),
          use: [{ loader: 'babel-loader' }]
        }
      ]
    },
    plugins: [relayCompilerWebpackPlugin, ...plugins]
  })
}
