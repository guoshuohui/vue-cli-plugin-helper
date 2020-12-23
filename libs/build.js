'use strict'

/**
 * code构建
 */

const child_process = require('child_process')
const chalk = require('chalk')

module.exports = async config => {
  return new Promise((resolve, reject) => {
    const task = config.api.service.pkg.scripts[config.helperConfig.build.script]

    // 创建子进程
    let spawn = null
    if (!task) {
      spawn = child_process.spawn('vue-cli-service', ['build', '--report'], {
        stdio: 'inherit'
      })
    } else {
      spawn = child_process.spawn(task, {
        shell: true,
        stdio: 'inherit'
      })
    }

    // 命令不存在，创建子进程错误
    spawn.on('error', err => {
      reject(err)
    })

    // 命令存在，运行报错
    spawn.stderr && spawn.stderr.on('data', () => {
      reject()
    })

    // 执行完成
    spawn.on('close', code => {
      if (!code) {
        resolve()
      }
    })
  })
}