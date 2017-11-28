const path = require("path");
const webpack = require("webpack");
const BundleTracker = require("webpack-bundle-tracker");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const RelayCompilerWebpackPlugin = require('relay-compiler-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  devtool: "eval",
  context: __dirname,

  entry: {
    website: [
      "webpack-dev-server/client?http://localhost:3000",
      "webpack/hot/only-dev-server",
      "./frontend/src/entry"
    ]
  },

  output: {
    path: __dirname + '/dist',
    filename: '[name]-[hash].js',
    publicPath: 'http://localhost:3000/'
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new BundleTracker({filename: "./webpack-stats.json"}),
    new ExtractTextPlugin({
      filename: "style-[name]-[hash].css",
      allChunks: true
    }),
    new HtmlWebpackPlugin({
      template: 'frontend/src/index.html'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('development')
      }
    }),
    new RelayCompilerWebpackPlugin({
      schema: path.resolve(__dirname, './data/schema.json'),
      src: path.resolve(__dirname, './frontend/src'),
    })
  ],

  module: {
    rules: [
      {
        test: /\.(ttf|eot|otf|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {loader: "file-loader"}
        ]
      },
      {
        test: /\.(gif|png|jpg)$/,
        use: [
          {loader: "url-loader?mimetype=image/png"}
        ]
      },
      {
        test: /\.css$/,
        use: [
          {loader: "style-loader"},
          {loader: "css-loader"},
          {loader: "autoprefixer-loader?browsers=last 10 versions"}
        ]
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          {loader: "url-loader?limit=464600&minetype=application/font-woff"}
        ]
      },
      {
        test: /\.js$/,
        exclude: path.join(__dirname, 'node_modules'),
        use: [
          {loader: "babel-loader"}
        ]
      }
    ]
  },

  resolve: {
    modules: [
      path.join(__dirname, 'node_modules'),
      path.join(__dirname, "src")
    ]
  }
};