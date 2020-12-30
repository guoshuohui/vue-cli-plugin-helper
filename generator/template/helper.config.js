/**
 * 助手配置
 */

const addZero = n => {
  const num = parseInt(n)
  return num < 10 ? 0 + '' + num : num
}

module.exports = {

  // build 配置
  build: {

    // 默认执行任务脚本
    script: 'build'
  },

  // cdn 配置
  cdn: {

    // 服务提供商，默认qiniu
    provider: 'qiniu',

    // 匹配规则
    globs: [
      '!**/*.html'
    ],

    // 本地资源路径
    // outputDir: 'dist',

    // 线上资源路径
    onlineDir: (() => {
      const date = new Date()
      return `dist/${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
    })(),

    // 上传后删除资源目录
    deleteDir: false,

    // 七牛配置
    qiniu: {

      // 域名
      domain: '',

      // 机房地域
      // 华东：Zone_z0
      // 华北：Zone_z1
      // 华南：Zone_z2
      // 北美：Zone_na0
      zone: 'Zone_z2',

      // 上传策略
      // https://developer.qiniu.com/kodo/manual/1206/put-policy
      options: {
        scope: '',
        expires: 7200,
        detectMime: 1,
        returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","name":"$(x:name)"}'
      },

      // 最大并发数
      maxConcurrent: 3
    }
  },

  // git 配置
  git: {

    // 仓库地址
    repo: '',

    // commit 类型
    type: [{
      type: 1,
      text: '新增需求'
    }, {
      type: 2,
      text: '需求变更'
    }, {
      type: 3,
      text: '问题修复'
    }],

    // push 分支
    branch: {

      // 测试环境
      test: 'deploy-test',

      // 预发布环境
      pre: 'deploy-pre',

      // 生产环境
      prod: 'deploy-prod'
    }
  }
}