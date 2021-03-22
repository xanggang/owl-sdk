const path = require('path')
const webpack = require('webpack')
// const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const isDev = process.env.NODE_ENV =='development'
const devServer = require('./webpack-dev-server')

const devConfig = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
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
  },
  plugins: [
    // new webpack.HotModuleReplacementPlugin(),
    // new ProgressBarPlugin({ summary: false }),
    new HtmlWebpackPlugin({
      title: 'wui',
      filename: 'index.html',
      template: path.join(__dirname, '../index.html'),
      inject: true
    })
  ]
}

devConfig.devServer = devServer.devServer

module.exports = devConfig
