'use strict'

/**
 * 服务商：七牛
 * 文档：https://developer.qiniu.com/kodo/sdk/1289/nodejs
 */

const { EOL } = require('os')
const qiniu = require('qiniu')
const chalk = require('chalk')

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
    this.uploadToken = putPolicy.uploadToken(mac)
    const config = new qiniu.conf.Config()
    config.zone = qiniu.zone[this.helperConfig.cdn.qiniu.zone]
    config.useHttpsDomain = true
    config.useCdnDomain = true
    this.formUploader = new qiniu.form_up.FormUploader(config)
    this.bucketManager = new qiniu.rs.BucketManager(mac, config)
    this.cdnManager = new qiniu.cdn.CdnManager(mac)
  }

  // 单文件上传
  _upload(file) {
    return new Promise((resolve, reject) => {
      const putExtra = new qiniu.form_up.PutExtra()
      const onlineFile = `${this.helperConfig.cdn.onlineDir}/${file}`
      this.formUploader.putFile(
        this.uploadToken,
        onlineFile,
        `${this.helperConfig.cdn.outputDir}/${file}`,
        putExtra,
        (err, body, info) => {
          if (info && +info.statusCode === 200) {
            const fsize = (body.fsize / 1000).toFixed(2)
            console.log(`https://${this.helperConfig.cdn.qiniu.domain}/${this.helperConfig.cdn.onlineDir}/${file}  ${chalk.black[fsize > 400 ? 'yellow' : 'cyan'](fsize + 'KB')}`)
            resolve()
          } else {
            reject(new Error(err))
          }
        }
      )
    })
  }

  // 推送方法
  async push() {
    return new Promise((resolve, reject) => {
      if (!this.distFiles.length) {
        console.log(chalk.black.yellow('暂无可推送的资源～'))
        return
      }
      (async () => {
        console.log(chalk.black.green('- 静态资源推送开始 -'))
        let counter = 0
        const startTime = new Date().getTime()
        for (let i in this.distFiles) {
          try {
            await this._upload(this.distFiles[i])
            counter++
          } catch (err) {
            reject(new Error(err))
            break
          }
        }
        if (counter === this.distFiles.length) {
          console.log(chalk.black.green(`- 静态资源推送完成，耗时 ${Math.ceil((new Date().getTime() - startTime) / 1000)}s -${EOL}`))
          resolve()
        }
      })()
    })
  }

  // 删除方法
  async remove() {
    return new Promise((resolve, reject) => {
      let items = [], deleteOperations = []
      let bucket = this.helperConfig.cdn.qiniu.options.scope

      if (this.args._.length) {
        items = this.args._
        deleteOperations = this.args._.map(item => {
          return qiniu.rs.deleteOp(bucket, item)
        })
      } else if (this.ignoreConfig.cdn.remove.length) {
        items = this.ignoreConfig.cdn.remove
        deleteOperations = this.ignoreConfig.cdn.remove.map(item => {
          return qiniu.rs.deleteOp(bucket, item)
        })
      } else {
        console.log(chalk.black.yellow('请输入或配置要删除的资源～'))
        return
      }

      // 如果文件夹内的文件被清空，目录也会自动被删除
      console.log(chalk.black.green('- 静态资源删除开始 -'))
      const startTime = new Date().getTime()
      this.bucketManager.batch(deleteOperations, (err, body) => {
        if (body && body.length) {
          let error = false
          body.forEach((item, index) => {
            if (+item.code === 200) {
              console.log(`${items[index]} ${chalk.black.green('Done')}`)
            } else {
              error = true
              console.log(`${items[index]}  ` + chalk.black.red(`Error：${item.code} ${item.data.error}`))
            }
          })
          if (error) {
            console.log(chalk.black.bgRed('错误：有文件删除失败哦～'))
            return
          }
          console.log(chalk.black.green(`- 静态资源删除完成，耗时 ${Math.ceil((new Date().getTime() - startTime) / 1000)}s -${EOL}`))
          resolve()
        }
      })
    })
  }

  // 刷新方法
  async refresh() {
    return new Promise((resolve, reject) => {
      let items = [], files = [], dirs = []
      if (this.args._.length) {
        items = this.args._
      } else if (this.ignoreConfig.cdn.refresh.length) {
        items = this.ignoreConfig.cdn.refresh
      } else {
        console.log(chalk.black.yellow('请输入或配置要刷新的资源～'))
        return
      }

      // http和https共享缓存，刷新会自动刷新两种协议的资源
      items.forEach(item => {
        let httpUrl = '', httpsUrl = ''
        if (!item.includes('http://') && !item.includes('https://')) {
          httpUrl = `http://${this.helperConfig.cdn.qiniu.domain}/${item}`
          httpsUrl = `https://${this.helperConfig.cdn.qiniu.domain}/${item}`
        } else {
          httpUrl = item.includes('https://') ? item.replace('https://', 'http://') : item
          httpsUrl = item.includes('http://') ? item.replace('http://', 'https://') : item
        }
        if (item.substring(item.lastIndexOf('/') + 1).includes('.')) {
          if (!files.includes(httpUrl)) files.push(httpUrl)
          if (!files.includes(httpsUrl)) files.push(httpsUrl)
        } else {
          if (!dirs.includes(httpUrl)) dirs.push(httpUrl)
          if (!dirs.includes(httpsUrl)) dirs.push(httpsUrl)
        }
      })

      // 单次要刷新的文件不可以超过100条
      if (files.length > 100 || dirs.length > 10) {
        console.log(chalk.black.yellow('单次刷新的文件不可以超过100条、目录不可以超过10个～'))
        return
      }

      const refreshUrls = async () => {
        return new Promise((resolve, reject) => {
          if (!files.length) resolve()
          this.cdnManager.refreshUrls(files, function (err, body) {
            if (+body.code === 200) {
              for (const i in body.taskIds) {
                console.log(`${i}  ${chalk.black.green('Done')}`)
              }
              resolve()
            } else {
              for (const i in body.invalidUrls) {
                console.log(chalk.black.red(body.invalidUrls[i]))
              }
              reject(`文件刷新错误：${body.code} ${body.error}`)
            }
          })
        })
      }

      const refreshDirs = async () => {
        return new Promise((resolve, reject) => {
          if (!dirs.length) resolve()
          this.cdnManager.refreshDirs(dirs, function (err, body) {
            if (+body.code === 200) {
              for (let i in body.taskIds) {
                console.log(`${i}  ${chalk.black.green('Done')}`)
              }
              resolve()
            } else {
              for (const i in body.invalidUrls) {
                console.log(chalk.black.red(body.invalidUrls[i]))
              }
              reject(`目录刷新错误：${body.code} ${body.error}`)
            }
          })
        })
      }

      (async () => {
        console.log(chalk.black.green('- CDN资源刷新开始 -'))
        const startTime = new Date().getTime()
        try {
          await refreshUrls()
          await refreshDirs()
          console.log(chalk.black.green(`- CDN资源刷新完成，耗时 ${Math.ceil((new Date().getTime() - startTime) / 1000)}s -${EOL}`))
          resolve()
        } catch (error) {
          console.log(chalk.black.bgRed(error))
          // reject(new Error(error))
        }
      })()
    })
  }

  // 预取方法
  async prefetch() {
    return new Promise((resolve, reject) => {
      let items = [], list = []
      if (this.args._.length) {
        items = this.args._
      } else if (this.ignoreConfig.cdn.prefetch.length) {
        items = this.ignoreConfig.cdn.prefetch
      } else {
        console.log(chalk.black.yellow('请输入或配置要预取的资源～'))
        return
      }

      if (items.some(item => {
        return !item.substring(item.lastIndexOf('/') + 1).includes('.')
      })) {
        console.log(chalk.black.red('预取的资源必须是文件～'))
        return
      }

      // http和https共享缓存，预取会自动预取两种协议的资源
      items.forEach(item => {
        let httpUrl = '', httpsUrl = ''
        if (!item.includes('http://') && !item.includes('https://')) {
          httpUrl = `http://${this.helperConfig.cdn.qiniu.domain}/${item}`
          httpsUrl = `https://${this.helperConfig.cdn.qiniu.domain}/${item}`
        } else {
          httpUrl = item.includes('https://') ? item.replace('https://', 'http://') : item
          httpsUrl = item.includes('http://') ? item.replace('http://', 'https://') : item
        }
        if (!list.includes(httpUrl)) list.push(httpUrl)
        if (!list.includes(httpsUrl)) list.push(httpsUrl)
      })

      // 单次要预取的文件不可以超过100条
      if (list.length > 100) {
        console.log(chalk.black.yellow('单次预取的文件不可以超过100条～'))
        return
      }

      console.log(chalk.black.green('- CDN资源预取开始 -'))
      const startTime = new Date().getTime()
      this.cdnManager.prefetchUrls(list, function (err, body) {
        if (+body.code === 200) {
          for (let i in body.taskIds) {
            console.log(`${i}  ${chalk.black.green('Done')}`)
          }
          console.log(chalk.black.green(`- CDN资源预取完成，耗时 ${Math.ceil((new Date().getTime() - startTime) / 1000)}s -${EOL}`))
          resolve()
        } else {
          for (const i in body.invalidUrls) {
            console.log(chalk.black.red(body.invalidUrls[i]))
          }
          console.log(chalk.black.bgRed(`目录刷新错误：${body.code} ${body.error}`))
        }
      })
    })
  }

  // 获取日志方法
  async getLog() {
    return new Promise((resolve, reject) => {
      let day = ''
      if (this.args._.length) {
        day = this.args._[0]
      } else if (this.ignoreConfig.cdn.log.day) {
        day = this.ignoreConfig.cdn.log.day
      } else {
        console.log(chalk.black.yellow('请输入或配置要获取的日志日期～'))
        return
      }

      let domains = this.ignoreConfig.cdn.log.domains
      if (!domains.length) {
        domains = [this.helperConfig.cdn.qiniu.domain]
      }

      console.log(chalk.black.green('- CDN日志地址获取开始 -'))
      const startTime = new Date().getTime()
      this.cdnManager.getCdnLogList(domains, day, function (err, body) {
        if (+body.code === 200) {
          const logData = body.data
          if (!Object.keys(logData).length) {
            console.log(chalk.black.red('暂无日志信息～'))
            return
          }
          domains.forEach(item => {
            const logs = logData[item]
            logs.forEach(list => {
              console.log(`${list.url}  ${chalk.black.green('Done')}`)
            })
          })
          console.log(chalk.black.green(`- CDN日志地址获取完成，耗时 ${Math.ceil((new Date().getTime() - startTime) / 1000)}s -${EOL}`))
          resolve()
        } else {
          console.log(chalk.black.red(`Error：${body.code} ${body.error}`))
        }
      })
    })
  }
}

