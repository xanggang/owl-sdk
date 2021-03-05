const path = require('path')

module.exports = {
  //...
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3001,
    // host: '0.0.0.0',
    proxy: {
      '/api': {
        // 调用本地的api
        target: `http://127.0.0.1:7001`,
      },
    }
  }
};
