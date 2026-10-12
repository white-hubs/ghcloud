import { timestampToDate, timestampToTime } from '@/utils/common'
const getSaleType = (text: number): string => {
  let saleType = ''
  switch (text) {
    case 1:
      saleType = '正常售电'
      break
    case 2:
      saleType = '冲正'
      break
    case 3:
      saleType = '退电'
      break
    case 4:
      saleType = '初始化'
      break
    case 5:
      saleType = '容量费'
      break
    default:
      saleType = '--'
  }
  return saleType
}

const getBuyType = (text: number): string => {
  let buyType = ''
  switch (text) {
    case 1:
      buyType = '现金缴费'
      break
    case 2:
      buyType = '刷卡机缴费'
      break
    case 3:
      buyType = '微信扫码支付'
      break
    case 4:
      buyType = '支付宝扫码支付'
      break
    case 5:
      buyType = '公对公转账'
      break
    case 6:
      buyType = '冲正或退电'
      break
    case 7:
      buyType = '微信支付'
      break
    case 8:
      buyType = '支付宝支付'
      break
    case 9:
      buyType = '容量费'
      break
    case 10:
      buyType = '充值批量导入'
      break
    case 11:
      buyType = '网银转账'
      break
    case 12:
      buyType = '公摊电费'
      break
    case 13:
      buyType = '基础电费'
      break
    case 14:
      buyType = '电费退补'
      break
    case 20:
      buyType = '在线卡充值'
      break
    default:
      buyType = '--'
  }
  return buyType
}
// 充值记录
export const rechargeColumns = [{
  title: '创建时间',
  dataIndex: 'rechargeTime',
  key: 'rechargeTime',
  customRender: ({ text }: { text: number; }): string => {
    return timestampToDate(text) + timestampToTime(text)
  }
},
{
  title: '售电金额',
  dataIndex: 'saleMoney',
  key: 'saleMoney',
},
{
  title: '购电类型',
  dataIndex: 'buyType',
  key: 'buyType',
  customRender: ({ text }: { text: number; }): string => {
    return getBuyType(text)
  }
},
{
  title: '售电类型',
  dataIndex: 'saleType',
  key: 'saleType',
  customRender: ({ text }: { text: number; }): string => {
    return getSaleType(text)
  }
},
{
  title: '上次累计金额',
  dataIndex: 'lastMoney',
  key: 'lastMoney',
}]
// 抄表记录
export const meterReadingColumns = [
  {
    title: '采集时间',
    dataIndex: 'collectTime',
    key: 'collectTime',
    customRender: ({ text }: { text: number; }): string => {
      return timestampToDate(text) + timestampToTime(text)
    }
  },
  {
    title: '剩余金额',
    dataIndex: 'powerRemain',
    key: 'powerRemain',
  },
  {
    title: '总用电量',
    dataIndex: 'powerTatol',
    key: 'powerTatol',
  },
  {
    title: '尖电能',
    dataIndex: 'powerHigher',
    key: 'powerHigher',
  },
  {
    title: '峰电能',
    dataIndex: 'powerHigh',
    key: 'powerHigh',
  },
  {
    title: '平电能',
    dataIndex: 'powerFlat',
    key: 'powerFlat',
  },
  {
    title: '谷电能',
    dataIndex: 'powerLow',
    key: 'recopowerLowrdId',
  },
  {
    title: '尖电价',
    dataIndex: 'priceHigher',
    key: 'priceHigher',
  },
  {
    title: '峰电价',
    dataIndex: 'priceHigh',
    key: 'priceHigh',
  },
  {
    title: '平电价',
    dataIndex: 'priceFlat',
    key: 'priceFlat',
  },
  {
    title: '谷电价',
    dataIndex: 'priceLow',
    key: 'priceLow',
  },
]


