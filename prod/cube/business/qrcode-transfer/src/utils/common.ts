const QRCODE_TRANSFER_IMAGES = '/resource/v1/qrcode-transfer/images'
export const getAssetsImge = (url: string): string => `${QRCODE_TRANSFER_IMAGES}/${url}`

export function getXdataByType (type: string, data: any[]): any[] {
  const XData = [...data]; let unit = ''
  switch (type) {
    case 'TODAY':
      unit = '时'
      break
    case 'THIS_WEEK':
      unit = '日'
      break
    case 'THIS_MONTH':
      unit = '日'
      break
    case 'THIS_YEAR':
      unit = '月'
      break
    default:
      unit = '时'
      break
  }
  XData[data.length - 1] = XData[data.length - 1] + unit
  return XData
}

export const getallNumber = (data: any, value: string) => {
  let total = 0
  data.forEach((_i: string, index: number) => {
    total += data[index][value]
  })

  return total
}
