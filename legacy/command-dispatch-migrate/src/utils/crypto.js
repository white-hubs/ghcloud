/**
 * 工具类
 * AES加密
 * 特别注意：（1）AES加密中需要前后端共同协商一个密文(密钥),用来加密/解密的（2）偏移量。
 * abcdefG1234567 代表此次密文
 */

import CryptoJS from "crypto-js";

// //ECB模式
//  export default {
//   // 加密
//    encrypt (word, keyStr) { // word, keyStr第一个参数是加密的字段名字  第二个是key值（16位）
//      keyStr = keyStr || 'abcdefG1234567' // 密文（密钥）
//      var key = CryptoJS.enc.Utf8.parse(keyStr)
//      var srcs = CryptoJS.enc.Utf8.parse(word)
//      var encrypted = CryptoJS.AES.encrypt(srcs, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7})
//      return encrypted.toString()
//    },
//    // 解密
//    decrypt (word, keyStr) {
//      keyStr = keyStr || 'abcdefG1234567'
//      var key = CryptoJS.enc.Utf8.parse(keyStr)// Latin1 w8m31+Yy/Nw6thPsMpO5fg==
//      var decrypt = CryptoJS.AES.decrypt(word, key, {mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7})
//      return CryptoJS.enc.Utf8.stringify(decrypt).toString()
//    }

//  }

//CBC模式
export default {
  // 特别注意：此次是将密文写死到函数内部，也可以当成函数的参数进行动态绑定密文,列如：
  encrypt(word) {
    let keyStr = "comguheyuncloud1"; // 密钥

    let ivStr = "comguheyuncloud1"; // 偏移量

    let key = CryptoJS.enc.Utf8.parse(keyStr);

    let iv = CryptoJS.enc.Utf8.parse(ivStr);

    let srcs = CryptoJS.enc.Utf8.parse(word);

    let encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,

      mode: CryptoJS.mode.CBC,

      padding: CryptoJS.pad.Pkcs7,
    });

    return encrypted.toString();
  },
  // 解密
  decrypt(word) {
    let keyStr = "comguheyuncloud1";

    let ivStr = "comguheyuncloud1";

    let base64 = CryptoJS.enc.Utf8.parse(word);

    var key = CryptoJS.enc.Utf8.parse(keyStr);

    let iv = CryptoJS.enc.Utf8.parse(ivStr);

    let src = CryptoJS.enc.Utf8.stringify(base64);

    var decrypt = CryptoJS.AES.decrypt(src, key, {
      iv,

      mode: CryptoJS.mode.CBC,

      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypt.toString(CryptoJS.enc.Utf8);
  },
};
