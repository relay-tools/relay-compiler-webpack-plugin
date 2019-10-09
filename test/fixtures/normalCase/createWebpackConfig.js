import path from 'path'

export default ({ relayCompilerWebpackPlugin }) => ({
  mode: 'production',
  entry: path.join(__dirname, 'src', 'entry.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
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
  plugins: [relayCompilerWebpackPlugin]
})
