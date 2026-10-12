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

export const handleDownload = async (data: Blob, fileName: string) => {
  return new Promise((resolve, reject) => {
    try {
    // 下载文件
      const link = document.createElement('a')
      const blob = new Blob([data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      resolve('')
    } catch (error) {
      reject(error)
    } finally {
      resolve('')
    }
  })
}
