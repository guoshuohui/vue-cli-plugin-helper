'use strict'

/**
 * 服务商：七牛
 * 文档：https://developer.qiniu.com/kodo/sdk/1289/nodejs
 */

const qiniu = require('qiniu')

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
  }

  // 单文件上传
  _upload(file) {
    const putExtra = new qiniu.form_up.PutExtra()
    this.formUploader.putFile(
      this.uploadToken,
      `${this.helperConfig.cdn.onlineDir}/${file}`,
      `${this.helperConfig.cdn.localDir}/${file}`,
      putExtra,
      (err, body, info) => {
        if (err) {
          reject(err)
          return
        }
        if (info && +info.statusCode === 200) {
          console.log(`https://${this.helperConfig.cdn.qiniu.domain}/${this.helperConfig.cdn.onlineDir}/${file}  ${(body.fsize / 1000).toFixed(2)}KB`)
        }
      }
    )
  }

  // 推送方法
  async push() {
    return new Promise((resolve, reject) => {
      this._upload('js/about.8ca181d9.js')
      // console.log(this.uploadToken)
      // console.log(this.helperConfig.cdn.onlineDir)
      // setTimeout(() => {
      //   console.log(this.distFiles)
      //   console.log(this.helperConfig.cdn.onlineDir)
      //   resolve()
      // }, 2000)
    })
  }

  // 删除方法
  async remove() {
    console.log('aaaaaaaaaa')
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

