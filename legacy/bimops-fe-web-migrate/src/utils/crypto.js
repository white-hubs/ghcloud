/**
 * 工具类
 * AES加密
 * 特别注意：（1）AES加密中需要前后端共同协商一个密文(密钥),用来加密/解密的（2）偏移量。
 * abcdefG1234567 代表此次密文
 */

import CryptoJS from "crypto-js";

//CBC模式
export default {
  /**
   * AES加密
   * @param {string} word - 需要加密的内容
   * @param {string} keyParam - 加密密钥，可选
   * @returns {string} - 加密后的字符串
   */
  encrypt(word, keyParam) {
    let keyStr = keyParam ?? "comguheyuncloud1"; // 密钥
    let ivStr = keyParam ?? "comguheyuncloud1"; // 偏移量

    let keyBytes = CryptoJS.enc.Utf8.parse(keyStr);
    let iv = CryptoJS.enc.Utf8.parse(ivStr);
    let srcs = CryptoJS.enc.Utf8.parse(word);

    let encrypted = CryptoJS.AES.encrypt(srcs, keyBytes, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  },

  /**
   * AES解密
   * @param {string} word - 需要解密的内容
   * @param {string} keyParam - 解密密钥，可选
   * @returns {string} - 解密后的字符串
   */
  decrypt(word, keyParam) {
    let keyStr = keyParam ?? "comguheyuncloud1";
    let ivStr = keyParam ?? "comguheyuncloud1";

    let wordBytes = CryptoJS.enc.Utf8.parse(word);
    let keyBytes = CryptoJS.enc.Utf8.parse(keyStr);
    let iv = CryptoJS.enc.Utf8.parse(ivStr);
    let src = CryptoJS.enc.Utf8.stringify(wordBytes);

    let decrypt = CryptoJS.AES.decrypt(src, keyBytes, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypt.toString(CryptoJS.enc.Utf8);
  },
};
