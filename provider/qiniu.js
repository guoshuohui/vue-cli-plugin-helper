'use strict'

const { reject } = require('lodash')
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
    const uploadToken = putPolicy.uploadToken(mac)
    const config = new qiniu.conf.Config()
    config.zone = qiniu.zone[this.helperConfig.cdn.qiniu.zone]
    config.useHttpsDomain = true
    config.useCdnDomain = true
  }

  // 推送方法
  async push() {
    return new Promise((resolve, reject) => {
      console.log(this.helperConfig.cdn.onlineDir)
      setTimeout(() => {
        console.log(this.distFiles)
        console.log(this.helperConfig.cdn.onlineDir)
        resolve()
      }, 2000)
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

