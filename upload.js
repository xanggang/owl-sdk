/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')
const upyun = require('upyun')

const args = process.argv
args.splice(0, 2)

const [ROOTPATH] = args


const { OPERATOR, PASSWORD, BUCKET, SOURCEFOLDER } = process.env

console.log(ROOTPATH, 'ROOTPATH')
console.log(SOURCEFOLDER, 'SOURCEFOLDER')

const basePath = path.resolve(process.cwd())
console.log(basePath, 'basePath')

const sourcefolder = path.join(basePath, SOURCEFOLDER)
console.log(sourcefolder, '读取路径')

// 利用upyun包准备上传工具
const service = new upyun.Service(BUCKET, OPERATOR, PASSWORD)
const client = new upyun.Client(service)
// 要上传的文件列表
const fileList = []
// 上传文件脚本
async function uploadFileList (fileList, client) {
  for (const item of fileList) {
    let file = null
    let remoteFile = null
    try {
      console.log('开始比对文件大小进行上传')
      remoteFile = await client.headFile(item.remotePath)
      const isVersionJson = item.name === 'version.json'
      const isYmlFile = path.extname(item.name) === '.yml'
      if (!isYmlFile && !isVersionJson && remoteFile && remoteFile.size === item.size && !/index.html$/.test(item.remotePath)) {
        console.log('\x1b[33m' + item.filePath + '\t不需要上传\x1b[0m')
      } else {
        file = fs.readFileSync(item.filePath)
        await client.putFile(item.remotePath, file)
        console.log('\x1b[32m' + item.filePath + '\t上传成功\x1b[0m')
      }
    } catch (err) {
      console.log('\x1b[35m' + item.filePath + '\t上传失败\x1b[0m')
      console.log(err)
      process.exit(1)
    }
  }
}
// 读出所有的文件
function findAllFile (uploadDir, relativePath) {
  console.log('读取文件')
  const dirExist = fs.existsSync(uploadDir)
  if (dirExist) {
    const res = fs.readdirSync(uploadDir)
    if (res.length === 0) {
      console.log('没有读取文件')
      return
    }
    const canUploadExt = ['.dmg', '.zip', '.yml']

    for (const item of res) {
      if (!fs.statSync(uploadDir + path.sep + item).isDirectory()) {
        const localPath = uploadDir + path.sep + item
        const fileExt = path.extname(item)
        if (!canUploadExt.includes(fileExt)) continue
        console.log(item)
        fileList.push({
          filePath: localPath,
          name: item,
          remotePath: relativePath + item,
          size: fs.statSync(localPath).size
        })
      }
    }
  }
}
console.log('开始执行脚本ing')
findAllFile(sourcefolder, ROOTPATH)
if (fileList.length === 0) {
  console.log('\x1b[31m没有要上传的资源\x1b[0m')
} else {
  console.log(`读取到${fileList.length}个文件`)
  console.log('开始上传')
  uploadFileList(fileList, client)
}
