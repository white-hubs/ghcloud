/**
 * 工具类
 * AES加密
 * 特别注意：（1）AES加密中需要前后端共同协商一个密文(密钥),用来加密/解密的（2）偏移量。
 * abcdefG1234567 代表此次密文
 */

import CryptoJS from 'crypto-js'

// CBC模式
export default {
  // 特别注意：此次是将密文写死到函数内部，也可以当成函数的参数进行动态绑定密文,列如：
  encrypt (word: string) {
    const keyStr = '023~20-!@($#@^$#' // 密钥

    const ivStr = '023~20-!@($#@^$#' // 偏移量

    const key = CryptoJS.enc.Utf8.parse(keyStr)

    const iv = CryptoJS.enc.Utf8.parse(ivStr)

    const srcs = CryptoJS.enc.Utf8.parse(word)

    const encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv,

      mode: CryptoJS.mode.CBC,

      padding: CryptoJS.pad.Pkcs7,
    })

    return encrypted.toString()
  },
  // 解密
  decrypt (word: string) {
    const keyStr = '023~20-!@($#@^$#'

    const ivStr = '023~20-!@($#@^$#'

    const base64 = CryptoJS.enc.Utf8.parse(word)

    const key = CryptoJS.enc.Utf8.parse(keyStr)

    const iv = CryptoJS.enc.Utf8.parse(ivStr)

    const src = CryptoJS.enc.Utf8.stringify(base64)

    const decrypt = CryptoJS.AES.decrypt(src, key, {
      iv,

      mode: CryptoJS.mode.CBC,

      padding: CryptoJS.pad.Pkcs7,
    })

    return decrypt.toString(CryptoJS.enc.Utf8)
  },
}
