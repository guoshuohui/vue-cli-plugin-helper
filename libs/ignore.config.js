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

    // 刷新资源
    refresh: {

      // 文件
      files: [],

      // 目录
      dirs: []
    },

    // 删除资源
    delete: {

      // 文件
      files: [],

      // 目录
      dirs: []
    },

    // 预取文件
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