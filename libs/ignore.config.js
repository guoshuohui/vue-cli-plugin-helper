'use strict'

/**
 * 默认忽略配置
 */

module.exports = {

  // cdn配置
  cdn: {

    // 七牛秘钥
    qiniu: {
      accessKey: '',
      secretKey: ''
    },

    // 删除资源，只能是文件，不带域名
    remove: [],

    // 刷新资源，支持目录和文件，目录最后必须加/，否则会被当作文件处理
    refresh: [],

    // 预取文件，只能是文件
    prefetch: [],

    // 获取日志
    logs: {

      // 域名，默认是当前 provider 的 domain
      domain: '',

      // 日期，默认今天，例如：['2020-12-20']
      dates: []
    }
  }
}