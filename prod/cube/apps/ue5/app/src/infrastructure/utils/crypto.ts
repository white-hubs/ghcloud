/**
 * AES 工具（CBC）
 * 前后端需协商同一密钥与偏移量。
 */
import CryptoJS from "crypto-js";

const KEY_STR = "comguheyuncloud1";
const IV_STR = "comguheyuncloud1";

function encrypt(word: string): string {
  const key = CryptoJS.enc.Utf8.parse(KEY_STR);
  const iv = CryptoJS.enc.Utf8.parse(IV_STR);
  const srcs = CryptoJS.enc.Utf8.parse(word);
  const encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

function decrypt(word: string): string {
  const key = CryptoJS.enc.Utf8.parse(KEY_STR);
  const iv = CryptoJS.enc.Utf8.parse(IV_STR);
  const base64 = CryptoJS.enc.Utf8.parse(word);
  const src = CryptoJS.enc.Utf8.stringify(base64);
  const decrypted = CryptoJS.AES.decrypt(src, key, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return decrypted.toString(CryptoJS.enc.Utf8);
}

const Crypto = {
  encrypt,
  decrypt,
};

export default Crypto;
