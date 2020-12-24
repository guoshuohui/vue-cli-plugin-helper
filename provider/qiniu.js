'use strict'

/**
 * 服务商：七牛
 * 文档：https://developer.qiniu.com/kodo/sdk/1289/nodejs
 */

const qiniu = require('qiniu')
const chalk = require('chalk')
const { isError } = require('lodash')
module.exports = class ProviderQiniu {
  constructor(config = {}) {
    this.api = config.api
    this.args = config.args
    this.ignoreConfig = config.ignoreConfig
    this.helperConfig = config.helperConfig
    this.distFiles = config.distFiles
    this._init()
  }

  // 初始化
  _init() {
    const mac = new qiniu.auth.digest.Mac(this.ignoreConfig.cdn.qiniu.accessKey, this.ignoreConfig.cdn.qiniu.secretKey)
    const putPolicy = new qiniu.rs.PutPolicy(this.helperConfig.cdn.qiniu.options)
    this.uploadToken = putPolicy.uploadToken(mac)
    const config = new qiniu.conf.Config()
    config.zone = qiniu.zone[this.helperConfig.cdn.qiniu.zone]
    config.useHttpsDomain = true
    config.useCdnDomain = true
    this.formUploader = new qiniu.form_up.FormUploader(config)
    this.bucketManager = new qiniu.rs.BucketManager(mac, config)
  }

  // 单文件上传
  _upload(file) {
    return new Promise((resolve, reject) => {
      const putExtra = new qiniu.form_up.PutExtra()
      const onlineFile = `${this.helperConfig.cdn.onlineDir}/${file}`
      this.formUploader.putFile(
        this.uploadToken,
        onlineFile,
        `${this.helperConfig.cdn.localDir}/${file}`,
        putExtra,
        (err, body, info) => {
          if (info && +info.statusCode === 200) {
            const fsize = (body.fsize / 1000).toFixed(2)
            console.log(`https://${this.helperConfig.cdn.qiniu.domain}/${this.helperConfig.cdn.onlineDir}/${file}  ${chalk.black[fsize > 400 ? 'yellow' : 'cyan'](fsize + 'KB')}`)
            resolve()
          } else {
            reject(new Error(err))
          }
        }
      )
    })
  }

  // 推送方法
  async push() {
    return new Promise((resolve, reject) => {
      if (!this.distFiles.length) {
        console.log(chalk.black.yellow('暂无可推送的资源～'))
        return
      }
      (async () => {
        console.log(chalk.black.green('- 静态资源推送开始 -'))
        let counter = 0
        const startTime = new Date().getTime()
        for (let i in this.distFiles) {
          try {
            await this._upload(this.distFiles[i])
            counter++
          } catch (err) {
            reject(new Error(err))
            break
          }
        }
        if (counter === this.distFiles.length) {
          console.log(chalk.black.green(`- 静态资源推送完成，耗时 ${Math.ceil((new Date().getTime() - startTime) / 1000)}s -\n`))
          resolve()
        }
      })()
    })
  }

  // 删除方法
  async remove() {
    return new Promise((resolve, reject) => {
      let items = []
      let deleteOperations = []
      let bucket = this.helperConfig.cdn.qiniu.options.scope

      if (this.args._.length) {
        items = this.args._
        deleteOperations = this.args._.map(item => {
          return qiniu.rs.deleteOp(bucket, item)
        })
      } else if (this.ignoreConfig.cdn.remove.length) {
        items = this.ignoreConfig.cdn.remove
        deleteOperations = this.ignoreConfig.cdn.remove.map(item => {
          return qiniu.rs.deleteOp(bucket, item)
        })
      } else {
        console.log(chalk.black.yellow('请输入或配置要删除的资源～'))
        return
      }

      // 如果文件夹内的文件被清空，目录也会自动被删除
      console.log(chalk.black.green('- 静态资源删除开始 -'))
      const startTime = new Date().getTime()
      this.bucketManager.batch(deleteOperations, (err, body, info) => {
        if (body && body.length) {
          let error = false
          body.forEach((item, index) => {
            if (+item.code === 200) {
              console.log(`${items[index]} ${chalk.black.green('Done')}`)
            } else {
              error = true
              console.log(`${items[index]}  ` + chalk.black.red(`Error：${item.code} ${item.data.error}`))
            }
          })
          if (error) {
            console.log(chalk.black.bgRed('错误：有文件删除失败哦～'))
            return
          }
          console.log(chalk.black.green(`- 静态资源删除完成，耗时 ${Math.ceil((new Date().getTime() - startTime) / 1000)}s -\n`))
          resolve()
        }
      })
    })
  }

  // 刷新方法
  async refresh() {

  }

  // 预取方法
  async prefetch() {

  }

  // 日志方法
  async getLogs() {

  }
}

