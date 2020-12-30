#!/usr/bin/env node

'use strict'

const { EOL } = require('os')
const fs = require('fs')
const { config } = require('process')

/**
 * 生成器
 */

module.exports = api => {
  api.render('./template')
  api.extendPackage({
    scripts: {
      'helper': 'vue-cli-service helper --help',
      'helper:build': 'vue-cli-service helper --build',
      'helper:cdn': 'vue-cli-service helper --cdn',
      'helper:git': 'vue-cli-service helper --git',
    },

    // https://github.com/vuejs/vue-cli/issues/2090
    vue: {
      pluginOptions: {
        ignore: 'ignoreConfigReplace',
        helper: 'helperConfigReplace'
      }
    }
  })
}

/** 
 * 钩子
 */

module.exports.hooks = api => {
  api.afterInvoke(() => {
    const vueConfigJs = 'vue.config.js'
    const file = fs.readFileSync(api.resolve(vueConfigJs), { encoding: 'utf-8' })
    const configContent = file.replace(/\'helperConfigReplace\'/g, "helperConfig").replace(/\'ignoreConfigReplace\'/g, 'ignoreConfig')
    const lines = configContent.split(/\r?\n/g)
    const helperIndex = lines.findIndex(line => line.match(/helper.config/))
    const ignoreIndex = lines.findIndex(line => line.match(/ignore.config/))
    if (helperIndex < 0) {
      lines[0] = `const helperConfig = require('./helper.config')${EOL}${lines[0]}`
    }
    if (ignoreIndex < 0) {
      lines[helperIndex + 1] = `const ignoreConfig = require('./ignore.config')${EOL}${lines[helperIndex + 1]}`
    }
    fs.writeFileSync(vueConfigJs, lines.join(EOL), { encoding: 'utf-8' })
  })
}