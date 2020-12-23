#!/usr/bin/env node

'use strict'

/**
 * service 命令
 */

const child_process = require('child_process')
const chalk = require('chalk')
const utils = require('./libs/utils')
const helperConfig = require('./libs/helper.config')
const ignoreConfig = require('./libs/ignore.config')
const build = require('./libs/build')
const cdn = require('./libs/cdn')
const git = require('./libs/git')

module.exports = (api, options) => {
  api.registerCommand('helper', {
    description: 'Vue CLI 工程助手',
    usage: 'vue-cli-service command [options] [arguments]',
    options: {
      'helper': utils.addSpace(`工程助手信息，${chalk.black.green('https://www.hiweb.cc/vue-cli-plugin-project-helper/')}`),
      'helper:build push [commit type] [commit msg]': utils.addSpace('code构建 + cdn推送 + git推送'),
      'helper:cdn push': utils.addSpace('推送资源文件到cdn'),
      'helper:cdn remove': utils.addSpace('删除cdn资源文件'),
      'helper:cdn refresh': utils.addSpace('刷新cdn资源文件'),
      'helper:cdn refresh dir': utils.addSpace('刷新cdn资源目录'),
      'helper:cdn prefetch': utils.addSpace('预获取cdn资源文件'),
      'helper:cdn getLogs': utils.addSpace('获取cdn访问日志'),
      'helper:git push [commit type] [commit msg]': utils.addSpace('推送当前项目代码到git')
    },
    details:
      'Warning: \n\n' +
      // chalk.black.yellow(utils.addSpace('1、package.json 文件中必须自己定义一条名为 build 的构建任务！\n')) +
      chalk.black.yellow(utils.addSpace('1、插件安装后，会自动往 package.json 中添加以上的命令，注意自有任务不要重名！\n')) +
      chalk.black.yellow(utils.addSpace('2、[commit type] 和 [commit msg] 是 git 的的提交信息，必须填写！否则无法顺利部署！\n'))
  }, async args => {
    console.log(args)

    const pluginOptions = options.pluginOptions

    // 任务配置错误
    // if (!api.service.pkg.scripts.build) {
    //   console.log(chalk.black.bgRed('错误：请先在 package.json 文件的 scripts 中新增一条 build 任务～'))
    //   return
    // }

    // 插件配置错误
    if (!pluginOptions || !pluginOptions.helper || !Object.keys(pluginOptions.helper).length) {
      console.log(chalk.black.bgRed('错误：请配置好 helper.config.js，并导入到 pluginOptions 对象中~'))
      return
    }

    // 忽略配置错误
    if (!pluginOptions.ignore || !Object.keys(pluginOptions.ignore)) {
      console.log(chalk.black.bgRed('错误：请配置好 ignore.config.js，并导入到 pluginOptions 对象中~'))
      return
    }

    // 任务输入错误
    if (!args.build && !args.cdn && !args.git) {
      console.log(chalk.black.bgRed('错误：请输入正确的任务，可执行 npm run helper 或 npx vue-cli-service helper 查看更多帮助信息~'))
      return
    }

    const config = { api, args }
    config.ignoreConfig = utils._.merge(ignoreConfig, pluginOptions.ignore)
    config.helperConfig = utils._.merge(helperConfig, pluginOptions.helper)

    console.log(chalk.black.green('--- 任务开始 ---'))

    if (args.build) {
      // await build(config)
      await cdn(config)
      // await git(config)
    } else if (args.cdn) {
      await cdn(config)
    } else if (args.git) {
      await git(config)
    }

    console.log(chalk.black.green('--- 任务完成 ---'))
  })
}