#!/usr/bin/env node

'use strict'

/**
 * service 命令
 */

const { EOL } = require('os')
const chalk = require('chalk')
const utils = require('./libs/utils')
const build = require('./libs/build')
const cdn = require('./libs/cdn')
const git = require('./libs/git')
const helperConfig = require('./generator/template/helper.config')
const ignoreConfig = require('./generator/template/ignore.config')

module.exports = (api, options) => {
  api.registerCommand('helper', {
    description: 'Vue CLI 工程助手',
    usage: 'vue-cli-service command [options] [arguments]',
    options: {
      'helper': utils.addSpace(`工程助手信息，${chalk.black.green('https://www.hiweb.cc/vue-cli-plugin-project-helper/')}`),
      'helper:build push [commit type] [commit msg]': utils.addSpace('code构建 + cdn推送 + git推送'),
      'helper:cdn push': utils.addSpace('推送资源文件到cdn'),
      'helper:cdn remove': utils.addSpace('删除cdn资源文件'),
      'helper:cdn refresh': utils.addSpace('刷新cdn资源目录或文件'),
      'helper:cdn prefetch': utils.addSpace('预获取cdn资源文件'),
      'helper:cdn getLog': utils.addSpace('获取cdn访问日志'),
      'helper:git push [commit type] [commit msg]': utils.addSpace('推送当前项目代码到git')
    },
    details:
      `Warning: ${EOL + EOL}` +
      chalk.black.yellow(utils.addSpace(`1、插件安装后，会自动往 package.json 中添加以上的命令，注意自有任务不要重名！${EOL}`)) +
      chalk.black.yellow(utils.addSpace(`2、[commit type] 和 [commit msg] 是 git 的的提交信息，必须填写！否则无法顺利部署！${EOL}`))
  }, async args => {
    // console.log(args)
    console.log(options)

    const pluginOptions = options.pluginOptions

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
    if (
      (!args.build && !args.cdn && !args.git) ||
      (args.cdn && !['push', 'remove', 'refresh', 'prefetch', 'getLog'].includes(args.cdn)) ||
      (args.git && !['push'].includes(args.git))
    ) {
      console.log(chalk.black.bgRed('错误：请输入正确的任务，可执行 npm run helper 或 npx vue-cli-service helper 查看更多帮助信息~'))
      return
    }

    if (!pluginOptions.helper.cdn.outputDir) {
      pluginOptions.helper.cdn.outputDir = options.outputDir
    }

    const config = { api, args }
    config.ignoreConfig = utils._.merge(ignoreConfig, pluginOptions.ignore)
    config.helperConfig = utils._.merge(helperConfig, pluginOptions.helper)

    console.log(config.helperConfig)

    // build 和 git 必须有 commit type 和 commit msg

    const buildStartTime = new Date().getTime()
    console.log(chalk.black.bgGreen(`任务开始 ${EOL}`))

    if (args.build) {
      await build(config)
      await cdn(config)
      await git(config)
    } else if (args.cdn) {
      await cdn(config)
    } else if (args.git) {
      await git(config)
    }

    console.log(chalk.black.bgGreen(`任务完成，总耗时 ${Math.ceil((new Date().getTime() - buildStartTime) / 1000)}s ${EOL}`))
  })
}