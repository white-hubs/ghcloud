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
