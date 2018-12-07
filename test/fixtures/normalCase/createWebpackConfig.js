import path from 'path'

export default ({ RelayCompilerWebpackPlugin }) => ({
  mode: 'production',
  entry: path.join(__dirname, 'src', 'entry.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
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
  plugins: [
    new RelayCompilerWebpackPlugin({
      schema: path.resolve(__dirname, 'schema.json'),
      src: path.resolve(__dirname, 'src')
    })
  ]
})
