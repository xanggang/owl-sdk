const glob = require('glob')
const path = require('path')
const fs = require('fs')
const http = require('http')
const packagePath = process.cwd()
const pkg = require(path.join(packagePath, 'package.json'))
const projectName = pkg.name

module.exports = class {
  constructor(option = {}) {
    if (!option.uploadUrl) {
      throw new Error('请输入uploadUrl')
    }
    this.uploadUrl = option.uploadUrl
  }

  apply(compiler) {
    if (process.env.NODE_ENV !== 'production') {
      return
    }
    compiler.hooks.done.tap('upload-sourcemap-plugin', async e => {
      const _path = e.compilation.options.output.path
      const list = glob.sync(path.join(_path, './**/*.{js.map,}'))
      for (let i of list) {
        await this.upload(i)
          .catch(e => {
            console.error(e);
          })
      }

    })
  }

  upload(filePath) {
    console.log('上传' + filePath);
    return new Promise((resolve, reject) => {
      const appName = projectName || 'not-name'
      const url = `${this.uploadUrl}?fileName=${path.basename(filePath)}&appName=${appName}`
      let option = {
        method: "POST",  //请求类型
        headers: {   //请求头
          'Content-Type': 'application/octet-stream',  //数据格式为二进制数据流
          'Transfer-Encoding': 'chunked',  //传输方式为分片传输
          'Connection': 'keep-alive'    //这个比较重要为保持链接。
        }
      }

      let req = http.request(url, option, res => {
        if (res.statusCode !== 200) {
          reject(`${filePath}上传失败`)
        } else {
          resolve(filePath)
          req.abort()
        }
      });
      fs.createReadStream(filePath)
        .on('data', chunk => {
          req.write(chunk)
        })
        .on('end', () => {
          req.end();
        })
    })
  }
}
