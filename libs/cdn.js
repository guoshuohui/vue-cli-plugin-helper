'use strict'

const walkSync = require('walk-sync')

/**
 * 服务提供商
 */

const Providers = {
  qiniu: require('../provider/qiniu'),
  // tencent: require('../provider/tencent')
}

/**
 * cdn服务
 */

module.exports = async config => {
  return new Promise((resolve, reject) => {

    // 获取打包文件
    let distFiles = []
    try {
      distFiles = walkSync(config.helperConfig.cdn.localDir, {
        globs: config.helperConfig.cdn.globs,
        directories: false
      })
    } catch (error) {
      reject(error)
      return
    }

    config.distFiles = distFiles

    // 实例化
    const Provider = new Providers[config.helperConfig.cdn.provider](config)

    // 以下方法是所有 Provider 都必备的，统一命名
    let method = ''
    if (config.args.build === 'push' || config.args.cdn === 'push') {
      method = 'push'
    } else if (config.args.remove) {
      method = 'remove'
    } else if (config.args.refresh) {
      method = 'refresh'
    } else if (config.args.prefetch) {
      method = 'prefetch'
    } else if (config.args.getLogs) {
      method = 'getLogs'
    }

    if (method) {
      return Provider[method]().then(() => {
        resolve()
      })
    }
  })
}