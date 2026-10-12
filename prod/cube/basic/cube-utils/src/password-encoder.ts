import crypto from 'crypto-js'

const key = 'comguheyuncloud1'
const iv = 'comguheyuncloud1'

export class PasswordEncoder {
  public static encode (word: string): string {
    const parseKey = crypto.enc.Utf8.parse(key)
    const parseIv = crypto.enc.Utf8.parse(iv)
    const parseWord = crypto.enc.Utf8.parse(word)
    return crypto.AES
      .encrypt(parseWord, parseKey, {
        iv: parseIv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
      })
      .toString()
  }

  public static decode (word: string): string {
    const parseWord = crypto.enc.Utf8.parse(word)
    const parseKey = crypto.enc.Utf8.parse(key)
    const parseIv = crypto.enc.Utf8.parse(iv)
    const sourceWord = crypto.enc.Utf8.stringify(parseWord)
    return crypto.AES
      .decrypt(sourceWord, parseKey, {
        iv: parseIv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7,
      })
      .toString(crypto.enc.Utf8)
  }
}
