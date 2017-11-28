const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  inline: true,
  historyApiFallback: true,
  headers: {
    "Access-Control-Allow-Origin": "http://localhost:3000"
  }
}).listen(3000, '0.0.0.0', function (err, result) {
    if (err) {
        console.log(err);
    }
    console.log('Listening at 0.0.0.0:3000');
});
