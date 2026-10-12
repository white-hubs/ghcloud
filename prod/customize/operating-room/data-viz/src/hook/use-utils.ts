import CryptoJS from 'crypto-js'
// 数字转为罗马数字
export function intToRoman (num: number): string {
  const val = [1000, 500, 100, 50, 10, 5, 1]
  const syb = ['M', 'D', 'C', 'L', 'X', 'V', 'I']

  let romanNum = ''
  for (let i = 0; i < val.length; i++) {
    while (num >= val[i]) {
      romanNum += syb[i]
      num -= val[i]
    }
  }
  return romanNum
}

// 保留数字精度
export function retainDecimals (num: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.trunc(num * factor) / factor
}

export const getImage = (url: string): string => {
  return new URL(`../assets/images/${url}`, import.meta.url).href
}
export const getImageThree = (url: string): string => {
  return new URL(`../assets/template-three/images/${url}`, import.meta.url).href
}

// 读取本地JSON文件数据
export async function getJsonFile (jsonUrl: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    fetch(jsonUrl)
      .then(async response => response.json())
      .then(data => {
        resolve(data)
      })
      .catch(error => {
        reject(error)
        throw new Error(error)
      })
  })
}
export function cacheEmpty (cacheKey: string): boolean {
  try {
    if (!cacheKey) return true
    const value = localStorage.getItem(cacheKey)
    if (!value || value === 'undefined' || value === 'null') return true
    return false
  } catch {
    return true
  }
}
export function getCacheByKey (cacheKey: string): unknown {
  try {
    if (!cacheKey) return undefined
    const value = localStorage.getItem(cacheKey)
    if (!value || value === 'undefined' || value === 'null') return undefined
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

export async function getHashByData (): Promise<string> {
  const response = await fetch('/data.js')
  const text = await response.text()
  const regex = /"authToken"\s*:\s*{[^}]*}(,?)\n?/g;
  const cleanedText = text.replace(regex, (match, comma) => comma ? '' : '');
  return CryptoJS.MD5(cleanedText).toString()
}
