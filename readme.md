vue-cli-plugin-project-helper 工程助手（以下简称Helper）是一款协助你轻松打包与部署代码、静态资源的 Vue-CLI 插件。

## 环境

- Node.js：>= v8.9（推荐 v10 以上）
- Vue-CLI：>= 3.5.0（推荐 4.0.0 以上）

## 安装

```
npm i vue-cli-plugin-project-helper --save-dev
```

> 注意 ⚠️ 
> 
> 包安装后，会自动往 package.json 中注入以下 N 条任务命令，自有任务请不要重名！

```
scripts: {
  'helper': 'vue-cli-service helper --help',
  'helper:build': 'vue-cli-service helper --build',
  'helper:cdn': 'vue-cli-service helper --cdn',
  'helper:git': 'vue-cli-service helper --git',
}
```

通过以下命令可以查看更多帮助信息

```
npm run helper
```

## 配置

Helper 有两个核心的配置项 `helper` 和 `ignore`，均为必备配置项，在项目根目录创建两个配置文件 `helper.config.js` 和 `ignore.config.js`，然后在 `vue.config.js` 中导入它们，可以是其他配置文件名，但是导入配置项的 key 必须是  `helper` 和 `ignore` :

```
const helperConfig = require('./helper.config')
const ignoreConfig = require('./ignore.config')

module.exports = {

  // 插件配置
  pluginOptions: {

    // 助手配置
    helper: helperConfig,

    // 忽略配置
    ignore: ignoreConfig
  }
}
```

> 注意 ⚠️
>
> ignore.config.js 必须添加到项目的 .gitignore 忽略文件中，它不能随仓库一同提交！

### helper 选项

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

#### - build配置

#### - cdn配置
#### - git配置

#### - 完整示例
### ignore 选项

并不是所有的配置信息都应该随代码一起被推送到仓库中，例如安全密钥、需要做临时cdn操作的信息，前者会泄露了安全信息，后者则容易造成冗余。`ignore` 的一级选项一般和 `helper` 一致，例如 build、cdn、git 等，主要包含以下配置：

- cdn服务提供商密钥信息
- 要删除的cdn资源
- 要刷新的cdn资源
- 要预取的cdn资源
- 要抓取的cdn日志
- 其他任意不需被提交到仓库的忽略信息

cdn 相关配置，位于 cdn 选项中

#### - qiniu

七牛密钥信息，服务提供商密钥为敏感且重要的信息，请不要随仓库代码一起提交，应该加入本地忽略文件中！

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

    // 删除资源，只能是文件，不带域名
    remove: [
      'dist/2020-12-24-10-26-32/img/demo.png',
      'dist/2020-12-24-10-26-32/js/demo.js'
    ],

    // 刷新资源，支持目录、文件和指定域名，目录最后必须加/，否则会被当作文件处理
    refresh: [
      'dist/2020-12-24-10-29-30/js/demo.js',
      'dist/2020-12-24-10-29-31/',
      'dist/2020-12-24-10-29-31',
      'https://cdn.xxx.com/dist/demo/demo.js'
    ],

    // 预取文件，只能是文件，支持指定域名
    prefetch: [
      'dist/2020-12-24-10-29-31/js/demo.js',
      'https://cdn.xxx.com/dist/demo/demo.js'
    ],

  }
}
```

## - 使用



