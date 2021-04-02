const path = require('path')
const devServer = require('./webpack-dev-server')

const devConfig = {
  mode: 'development',
  entry: {
    main: path.join(__dirname, '../sdk/index.ts'),
    'plugins/vue': path.join(__dirname, '../sdk/vue.ts'),
    'plugins/browser': path.join(__dirname, '../sdk/browser.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.join(__dirname, '../dist'),
    publicPath: '/',
    // export to AMD, CommonJS, or window
    libraryTarget: 'umd',
    // the name exported to window
    library: 'OwlSdk',
    libraryExport: 'default',
  },
  resolve: {
    extensions: [
      '.ts', '.js'
    ]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(ts)$/,
        exclude: /node_modules/,
        loader: 'ts-loader'
      }
    ]
  }
}

devConfig.devServer = devServer.devServer

module.exports = devConfig
