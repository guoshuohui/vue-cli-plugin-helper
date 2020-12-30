vue-cli-plugin-project-helper 工程助手（以下简称 Helper）是一款协助你轻松打包与部署代码、静态资源的 Vue-CLI 插件。一定程度的解放你的双手！


## 目录

- [环境](#环境)
- [安装](#安装)
- [配置](#配置)
  - [自动注入配置](#自动注入配置)
  - [手动更改配置](#手动更改配置)
	  - [helper选项](#helper选项)
	  - [ignore选项](#ignore选项)
- [命令](#命令)
  - [代码构建](#代码构建)
  - [资源部署](#资源部署)
  - [代码部署](#代码部署)

## 环境

- Node.js：>= v8.9（推荐 v10 以上）
- Vue-CLI：>= 3.5.0（推荐 4.0.0 以上）

## 安装

```
npm i vue-cli-plugin-project-helper --save-dev
```

执行 `npm run helper` 可查看帮助信息。

## 配置

### 自动注入配置

1、Helper 安装后，会自动往 `package.json` 中注入以下 N 条任务命令，自有任务请不要重名！

```
scripts: {
  'helper': 'vue-cli-service helper --help',
  'helper:build': 'vue-cli-service helper --build',
  'helper:cdn': 'vue-cli-service helper --cdn',
  'helper:git': 'vue-cli-service helper --git',
}
```

2、项目根目录会自动创建两个配置文件 `helper.config.js` 和 `ignore.config.js`，其中 `ignore.config.js` 会被自动加入到 git 的 `.gitignore` 忽略配置文件中。

3、`vue.config.js` 文件会自动引入和传递配置选项到 pluginOptions 中，如果 `vue.config.js` 文件不存在，Helper 会自动创建并配置。

```
const ignoreConfig = require('./ignore.config')
const helperConfig = require('./helper.config')
module.exports = {
  pluginOptions: {
    ignore: ignoreConfig,
    helper: helperConfig
  }
}
```

> 注意 ⚠️
>
> `ignore.config.js` 必须加入 git 忽略配置中，因为它可能包含敏感信息！

### 手动更改配置

前面自动注入的配置为默认项，一般还需要手动配置以下重要配置项，以便部署过程能顺利进行。

1、配置 cdn 云存储服务提供商信息

服务提供商默认使用七牛云，后续也会增加其他服务商，例如tencent、aliyun、upyun等。

```
// helper.config.js

cdn: {
  provider: 'qiniu'
}
```

配置服务提供商安全秘钥，注意这里的 qiniu 字段就是对应服务商名，和以上的 provider 名对应 。

```
// helper.config.js

cdn: {
  qiniu: {
    accessKey: 'xxx',
    secretKey: 'xxx'
  }
}
```

2、配置打包部署路径

`helper.config.js` 中的 cdn.outputDir 为生产环境构建文件的目录 - `dist`，默认读取 `vue.config.js` 的 outputDir 选项，当然，你也可以自定义其他路径，以便在独立执行 `helper:cdn` 命令时可以推送指定目录资源。它们的配置顺序如下，一般你不需要去改这个选项，默认即可。

```
helper.config.js > vue.config.js > cli default（dist）
```

cdn.onlineDir 选项用于指定 cdn 云存储上的主目录（推荐应用英文名），推荐使用“主目录 + 时间目录”形式来命名，可以更好的辨识版本。当然，你也可以只指定主目录，这样可以让没有被篡改 hash 的静态资源在用户访问应用时，不会每次都请求新的版本，一定程度上缩短 cdn 访问时长。

```
// helper.config.js

// 带时间目录
onlineDir: (() => {
  const date = new Date()
  return `dist/${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`
})()

// 不带时间目录
onlineDir: 'dist'
```

3、指定存储空间

每个服务商对应的存储空间（Bucket）都不同，配置和命名也会对应 SDK 命名，以下为七牛云的存储空间配置

```
// helper.config.js

cdn: {
  qiniu: {
    options: {
      scope: 'bucket'
    }
  }
}
```

4、最大并发数

资源每次推送并发数，每个服务提供商的可并发数都不尽相同，七牛云一般最高为 3，如果你网络状况很不好，也可以使用 1，默认即可。

> 更多配置信息帮助，请阅读一下说明
### helper选项

helper 选项是插件和核心配置文件，该文件将会随代码一起被推送到仓库中，主要包含以下配置：

- 本地资源匹配规则
- 本地资源路径
- 存储服务器资源路径
- cdn服务提供商
- cdn域名配置
- cdn机房选择
- cdn上传策略、存储空间、时效等
- cdn推送并发数
- git推送仓库地址
- git提交类型配置（规范）
- git推送分支配置

#### - build

#### -cdn
#### - git

#### - 完整示例
### ignore选项

并不是所有的配置信息都应该随代码一起被推送到仓库中，例如安全密钥、需要做临时cdn操作的信息，前者会泄露了安全信息，后者则容易造成冗余。`ignore` 的一级选项一般和 `helper` 一致，例如 build、cdn、git 等，主要包含以下配置：

- cdn服务提供商密钥信息
- 要删除的cdn资源
- 要刷新的cdn资源
- 要预取的cdn资源
- 要抓取的cdn日志
- 其他任意不需被提交到仓库的忽略信息

cdn 相关配置，位于 cdn 选项中

#### - qiniu

七牛云密钥信息，服务提供商密钥为敏感且重要的信息，请不要随仓库代码一起提交，应该加入本地忽略文件中！

```
qiniu: {
  accessKey: 'xxxx',
  secretKey: 'xxxx'
}
```
#### - remove

删除当前云存储域名和指定存储空间下的文件资源，不能是目录，不能带域名，域名采用当前 provider 对应的 domain

```
remove: [

  // 正确
  'dist/2020-12-24-10-26-32/js/demo.js',

  // 错误
  '/dist/demo/'
  'https://cdn.xxx.com/dist/demo/demo.js'
],
```

#### - refresh

刷新 cdn 上的资源，支持目录、文件，目录最后必须加/，否则会被当做文件处理。支持指定域名，域名必须是合法的已解析到云存储服务器上的域名。

```
refresh: [

  // 目录
  'dist/2020-12-24-10-29-31/',

  // 文件
  'dist/2020-12-24-10-29-31',
  'dist/2020-12-24-10-29-30/js/demo.js',
  'https://cdn.xxx.com/dist/demo/demo.js'
]
```

#### - prefetch

与获取 cdn 上的资源，只能是文件，支持指定域名，域名必须是合法的已解析到云存储服务器上的域名。

```
prefetch: [
  'dist/2020-12-24-10-29-31/js/demo.js',
  'https://cdn.xxx.com/dist/demo/demo.js'
],
```

在 cdn 中，http 和 https 一般是共享缓存，refresh 和 prefetch 方法内部会自动创建和处理两条协议的资源，假设你配置了一下需要处理的资源

```
refresh: [
  'dist/2020-12-24-10-29-30/'
  'dist/2020-12-24-10-29-30/'
  'dist/2020-12-24-10-29-31/js/demo.js',
  'dist/2020-12-24-10-29-31/js/demo.js',
  'http://cdn.xxx.com/dist/demo/demo.js'
  'http://cdn.xxx.com/dist/demo/demo.js'
]
```

最终处理的资源会变成如下，可以看到，每条配置的资源都会自动两条协议的资源（http 和 https），并且做了去重处理，所以同一条资源，一般只需配置一次即可。

```
refresh: [
  'http://provider.domain/dist/2020-12-24-10-29-30/'
  'https://provider.domain/dist/2020-12-24-10-29-30/'

  'http://provider.domain/dist/2020-12-24-10-29-31/js/demo.js',
  'https://provider.domain/dist/2020-12-24-10-29-31/js/demo.js',

  'http://cdn.xxx.com/dist/demo/demo.js',
  'https://cdn.xxx.com/dist/demo/demo.js'
]
```

#### - getLog

获取资源访问日志，便于问题排查。域名可以配置多个，但是日期只能输入或者配置一个，避免数据量太大～

```
log: {
  domains: [
    'cdn.a.com',
    'cdn.b.com'
  ],
  day: '2020-12-20'
}
```

#### - 完整示例

```
module.exports = {

  // cdn配置
  cdn: {

    // 七牛秘钥
    qiniu: {
      accessKey: 'xxxx',
      secretKey: 'xxxx'
    },

    // 删除资源
    remove: [
      'dist/2020-12-24-10-26-32/img/demo.png',
      'dist/2020-12-24-10-26-32/js/demo.js'
    ],

    // 刷新资源
    refresh: [
      'dist/2020-12-24-10-29-30/js/demo.js',
      'dist/2020-12-24-10-29-31/',
      'dist/2020-12-24-10-29-31',
      'https://cdn.xxx.com/dist/demo/demo.js'
    ],

    // 预取文件
    prefetch: [
      'dist/2020-12-24-10-29-31/js/demo.js',
      'https://cdn.xxx.com/dist/demo/demo.js'
    ],

    // 获取日志
    getLog: [

    ]
  }
}
```

## 命令

### 代码构建

### 资源部署


### 代码部署