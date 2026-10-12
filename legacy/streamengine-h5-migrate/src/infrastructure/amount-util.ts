/** 金额转千分位 */
export const translateAmount = (value: string | number): string => {
  if (value === 0 || value === '0') {
    return '0.00'
  }
  if (value) {
    const num = value.toString().split('.')
    let znum = (num[0] || 0).toString(); let result = ''
    while (znum.length > 3) {
      result = ',' + znum.slice(-3) + result
      znum = znum.slice(0, znum.length - 3)
    }
    if (znum) { result = znum + result }

    let fnum = num[1]
    if (fnum) {
      if (fnum.length === 1) {
        fnum = fnum + '0'
      }
    } else {
      fnum = '00'
    }
    return result + '.' + fnum
  }
  return '--'
}
