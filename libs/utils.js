'use strict'

/**
 * 工具集
 */

module.exports = {

  // lodash
  _: require('lodash'),

  // 补充空格
  addSpace(str, num = 2) {
    let space = ''
    for (let i = 0; i < num; i++) {
      space += ' '
    }
    return space + str
  },

  // 补零
  addZero (n) {
    const num = parseInt(n)
    return num < 10 ? 0 + '' + num : num
  }
}