#!/usr/bin/env node

'use strict'

/**
 * 生成器
 */

module.exports = api => {
  api.extendPackage({

    // 自动添加任务
    scripts: {
      'helper': 'vue-cli-service helper --help',
      'helper:build': 'vue-cli-service helper --build',
      'helper:cdn': 'vue-cli-service helper --cdn',
      'helper:git': 'vue-cli-service helper --git',
    }
  })
}