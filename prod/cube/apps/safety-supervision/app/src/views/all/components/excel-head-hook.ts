import { message } from 'ant-design-vue'
import { summaryTemplate0611, summaryTemplate0506, summaryTemplate20250520, summaryTemplate20260116 } from './summary-template'
// @ts-expect-error
import exportExcel from '@/hook/export-excel.js'
import dayjs from 'dayjs'

export const setValue = (row: number, column: number, value: string | number): void => {
  try {
    // @ts-expect-error
    window.luckysheet.setCellValue(row, column, value)
  } catch {

  }
}

// = SUM(深圳!E13,湖南长沙海吉星!E13,深圳福田区!E13,深圳南山区!E13,湖南岳阳海吉星!E13,安徽安庆海吉星!E13,南山海吉星!E13,长春海吉星!E13,宁夏海吉星!E13,九江农批!E13,深圳平湖海吉星!E13,天津静海海吉星!E13,上海农批!E13,南昌!E13,广西新柳邕海吉星!E13,安徽蚌埠海吉星!E13,广西南宁海吉星!E13,广东惠州海吉星!E13,创意园区!E13,光明!E13,测试环境Chen租户数据采集!E13)
const marketNameToSUM = (marketNameList: string[], cellName: string): string | number => {
  const res = marketNameList.map(e => {
    return `${e}!${cellName}`
  }).join(',')

  return res ? `=SUM(${res})` : 0
}

const setTemplateValue0506 = (marketNameList: string[]): void => {
  for (let index = 13; index <= 29; index++) {
    for (let i = 5; i <= 13; i++) {
      setValue(index - 1, i - 1, marketNameToSUM(marketNameList, String.fromCharCode(64 + i) + index))
    }
  }

  setValue(30, 4, marketNameToSUM(marketNameList, 'E31'))
  setValue(32, 4, marketNameToSUM(marketNameList, 'E33'))
  setValue(30, 6, marketNameToSUM(marketNameList, 'G31'))
  setValue(32, 6, marketNameToSUM(marketNameList, 'G33'))
  setValue(30, 8, marketNameToSUM(marketNameList, 'I31'))
  setValue(32, 8, marketNameToSUM(marketNameList, 'I33'))
  setValue(30, 10, marketNameToSUM(marketNameList, 'K31'))
  setValue(32, 10, marketNameToSUM(marketNameList, 'K33'))
  setValue(30, 12, marketNameToSUM(marketNameList, 'M31'))
  setValue(32, 12, marketNameToSUM(marketNameList, 'M33'))

  setValue(34, 4, marketNameToSUM(marketNameList, 'E35'))
  setValue(35, 4, marketNameToSUM(marketNameList, 'E36'))
  setValue(36, 5, marketNameToSUM(marketNameList, 'F37'))
  setValue(37, 5, marketNameToSUM(marketNameList, 'F38'))
  setValue(36, 7, marketNameToSUM(marketNameList, 'H37'))
  setValue(38, 4, marketNameToSUM(marketNameList, 'E39'))

  setValue(4, 4, marketNameToSUM(marketNameList, 'E5:F5'))
  setValue(5, 4, marketNameToSUM(marketNameList, 'E6:F6'))
  setValue(6, 4, marketNameToSUM(marketNameList, 'E7:F7'))
  setValue(7, 4, marketNameToSUM(marketNameList, 'E8:F8'))
  setValue(8, 4, marketNameToSUM(marketNameList, 'E9:F9'))
  setValue(9, 4, marketNameToSUM(marketNameList, 'E10:F10'))

  setValue(4, 6, marketNameToSUM(marketNameList, 'G5:J5'))
  setValue(5, 6, marketNameToSUM(marketNameList, 'G6:J6'))
  setValue(6, 6, marketNameToSUM(marketNameList, 'G7:J7'))
  setValue(7, 6, marketNameToSUM(marketNameList, 'G8:J8'))

  setValue(4, 10, marketNameToSUM(marketNameList, 'K5:M5'))
  setValue(5, 10, marketNameToSUM(marketNameList, 'K6:M6'))
  setValue(6, 10, marketNameToSUM(marketNameList, 'K7:M7'))
  setValue(7, 10, marketNameToSUM(marketNameList, 'K8:M8'))

  setValue(9, 11, marketNameToSUM(marketNameList, 'L10'))
}
const setTemplateValue0611 = (marketNameList: string[]): void => {
  setValue(4, 4, marketNameToSUM(marketNameList, 'E5:F5'))
  setValue(5, 4, marketNameToSUM(marketNameList, 'E6:F6'))
  setValue(6, 4, marketNameToSUM(marketNameList, 'E7:F7'))
  setValue(7, 4, marketNameToSUM(marketNameList, 'E8:F8'))
  setValue(8, 4, marketNameToSUM(marketNameList, 'E9:F9'))
  setValue(9, 4, marketNameToSUM(marketNameList, 'E10:F10'))
  setValue(4, 6, marketNameToSUM(marketNameList, 'G5:J5'))
  setValue(5, 6, marketNameToSUM(marketNameList, 'G6:J6'))
  setValue(6, 6, marketNameToSUM(marketNameList, 'G7:J7'))
  setValue(7, 6, marketNameToSUM(marketNameList, 'G8:J8'))
  setValue(4, 10, marketNameToSUM(marketNameList, 'K5:M5'))
  setValue(5, 10, marketNameToSUM(marketNameList, 'K6:M6'))
  setValue(6, 10, marketNameToSUM(marketNameList, 'K7:M7'))
  setValue(7, 10, marketNameToSUM(marketNameList, 'K8:M8'))
  setValue(9, 11, marketNameToSUM(marketNameList, 'L10'))

  for (let index = 13; index <= 29; index++) {
    for (let i = 5; i <= 13; i++) {
      setValue(index - 1, i - 1, marketNameToSUM(marketNameList, String.fromCharCode(64 + i) + index))
    }
  }

  setValue(30, 4, marketNameToSUM(marketNameList, 'E31'))
  setValue(32, 4, marketNameToSUM(marketNameList, 'E33'))
  setValue(33, 4, marketNameToSUM(marketNameList, 'E34'))

  setValue(30, 6, marketNameToSUM(marketNameList, 'G31'))
  setValue(32, 6, marketNameToSUM(marketNameList, 'G33'))
  setValue(33, 6, marketNameToSUM(marketNameList, 'G34'))

  setValue(30, 8, marketNameToSUM(marketNameList, 'I31'))
  setValue(32, 8, marketNameToSUM(marketNameList, 'I33'))
  setValue(33, 8, marketNameToSUM(marketNameList, 'I34'))

  setValue(30, 10, marketNameToSUM(marketNameList, 'K31'))
  setValue(32, 10, marketNameToSUM(marketNameList, 'K33'))
  setValue(30, 12, marketNameToSUM(marketNameList, 'M31'))
  setValue(32, 12, marketNameToSUM(marketNameList, 'M33'))

  setValue(35, 4, marketNameToSUM(marketNameList, 'E36'))
  setValue(36, 4, marketNameToSUM(marketNameList, 'E37'))
  setValue(37, 5, marketNameToSUM(marketNameList, 'F38'))
  setValue(38, 5, marketNameToSUM(marketNameList, 'F39'))
  setValue(37, 7, marketNameToSUM(marketNameList, 'H38'))
  setValue(39, 4, marketNameToSUM(marketNameList, 'E40'))
}
const setTemplateValue20250520 = (marketNameList: string[]): void => {
  setValue(4, 4, marketNameToSUM(marketNameList, 'E5:F5'))
  setValue(5, 4, marketNameToSUM(marketNameList, 'E6:F6'))
  setValue(6, 4, marketNameToSUM(marketNameList, 'E7:F7'))
  setValue(7, 4, marketNameToSUM(marketNameList, 'E8:F8'))
  setValue(8, 4, marketNameToSUM(marketNameList, 'E9:F9'))
  setValue(9, 4, marketNameToSUM(marketNameList, 'E10:F10'))
  setValue(4, 6, marketNameToSUM(marketNameList, 'G5:J5'))
  setValue(5, 6, marketNameToSUM(marketNameList, 'G6:J6'))
  setValue(6, 6, marketNameToSUM(marketNameList, 'G7:J7'))
  setValue(7, 6, marketNameToSUM(marketNameList, 'G8:J8'))
  setValue(4, 10, marketNameToSUM(marketNameList, 'K5:M5'))
  setValue(5, 10, marketNameToSUM(marketNameList, 'K6:M6'))
  setValue(6, 10, marketNameToSUM(marketNameList, 'K7:M7'))
  setValue(7, 10, marketNameToSUM(marketNameList, 'K8:M8'))
  setValue(9, 11, marketNameToSUM(marketNameList, 'L10'))

  for (let index = 13; index <= 29; index++) {
    for (let i = 5; i <= 13; i++) {
      setValue(index - 1, i - 1, marketNameToSUM(marketNameList, String.fromCharCode(64 + i) + index))
    }
  }
  setValue(31, 4, marketNameToSUM(marketNameList, 'E32'))
  setValue(32, 4, marketNameToSUM(marketNameList, 'E33'))
  setValue(31, 6, marketNameToSUM(marketNameList, 'G32'))
  setValue(32, 6, marketNameToSUM(marketNameList, 'G33'))
  setValue(31, 8, marketNameToSUM(marketNameList, 'I32'))
  setValue(32, 8, marketNameToSUM(marketNameList, 'I33'))
  setValue(31, 10, marketNameToSUM(marketNameList, 'k32'))
  setValue(32, 10, marketNameToSUM(marketNameList, 'K33'))

  setValue(33, 4, marketNameToSUM(marketNameList, 'E34'))
  setValue(35, 4, marketNameToSUM(marketNameList, 'E36'))
  setValue(36, 4, marketNameToSUM(marketNameList, 'E37'))

  setValue(33, 6, marketNameToSUM(marketNameList, 'G34'))
  setValue(35, 6, marketNameToSUM(marketNameList, 'G36'))
  setValue(36, 6, marketNameToSUM(marketNameList, 'G37'))

  setValue(33, 8, marketNameToSUM(marketNameList, 'I34'))
  setValue(35, 8, marketNameToSUM(marketNameList, 'I36'))
  setValue(36, 8, marketNameToSUM(marketNameList, 'I37'))

  setValue(33, 10, marketNameToSUM(marketNameList, 'K34'))
  setValue(35, 10, marketNameToSUM(marketNameList, 'K36'))
  setValue(33, 12, marketNameToSUM(marketNameList, 'M34'))
  setValue(35, 12, marketNameToSUM(marketNameList, 'M36'))

  setValue(38, 4, marketNameToSUM(marketNameList, 'E39'))
  setValue(39, 4, marketNameToSUM(marketNameList, 'E40'))
  setValue(42, 4, marketNameToSUM(marketNameList, 'E43'))
  setValue(40, 5, marketNameToSUM(marketNameList, 'F41'))
  setValue(41, 5, marketNameToSUM(marketNameList, 'F42'))
  setValue(40, 7, marketNameToSUM(marketNameList, 'H41'))
}
const setTemplateValue20260116 = (marketNameList: string[]): void => {
  setValue(4, 4, marketNameToSUM(marketNameList, 'E5:F5'))
  setValue(5, 4, marketNameToSUM(marketNameList, 'E6:F6'))
  setValue(6, 4, marketNameToSUM(marketNameList, 'E7:F7'))
  setValue(7, 4, marketNameToSUM(marketNameList, 'E8:F8'))
  setValue(8, 4, marketNameToSUM(marketNameList, 'E9:F9'))
  setValue(9, 4, marketNameToSUM(marketNameList, 'E10:F10'))
  setValue(4, 6, marketNameToSUM(marketNameList, 'G5:J5'))
  setValue(5, 6, marketNameToSUM(marketNameList, 'G6:J6'))
  setValue(6, 6, marketNameToSUM(marketNameList, 'G7:J7'))
  setValue(7, 6, marketNameToSUM(marketNameList, 'G8:J8'))
  setValue(4, 10, marketNameToSUM(marketNameList, 'K5:M5'))
  setValue(5, 10, marketNameToSUM(marketNameList, 'K6:M6'))
  setValue(6, 10, marketNameToSUM(marketNameList, 'K7:M7'))
  setValue(7, 10, marketNameToSUM(marketNameList, 'K8:M8'))
  setValue(9, 11, marketNameToSUM(marketNameList, 'L10'))

  for (let index = 13; index <= 29; index++) {
    for (let i = 5; i <= 13; i++) {
      setValue(index - 1, i - 1, marketNameToSUM(marketNameList, String.fromCharCode(64 + i) + index))
    }
  }
  setValue(31, 4, marketNameToSUM(marketNameList, 'E32'))
  setValue(32, 4, marketNameToSUM(marketNameList, 'E33'))
  setValue(31, 6, marketNameToSUM(marketNameList, 'G32'))
  setValue(32, 6, marketNameToSUM(marketNameList, 'G33'))
  setValue(31, 8, marketNameToSUM(marketNameList, 'I32'))
  setValue(32, 8, marketNameToSUM(marketNameList, 'I33'))
  setValue(31, 10, marketNameToSUM(marketNameList, 'k32'))
  setValue(32, 10, marketNameToSUM(marketNameList, 'K33'))

  setValue(33, 4, marketNameToSUM(marketNameList, 'E34'))
  setValue(35, 4, marketNameToSUM(marketNameList, 'E36'))
  setValue(36, 4, marketNameToSUM(marketNameList, 'E37'))

  setValue(33, 6, marketNameToSUM(marketNameList, 'G34'))
  setValue(35, 6, marketNameToSUM(marketNameList, 'G36'))
  setValue(36, 6, marketNameToSUM(marketNameList, 'G37'))

  setValue(33, 8, marketNameToSUM(marketNameList, 'I34'))
  setValue(35, 8, marketNameToSUM(marketNameList, 'I36'))
  setValue(36, 8, marketNameToSUM(marketNameList, 'I37'))

  setValue(33, 10, marketNameToSUM(marketNameList, 'K34'))
  setValue(35, 10, marketNameToSUM(marketNameList, 'K36'))
  setValue(33, 12, marketNameToSUM(marketNameList, 'M34'))
  setValue(35, 12, marketNameToSUM(marketNameList, 'M36'))

  setValue(38, 4, marketNameToSUM(marketNameList, 'E39'))
  setValue(39, 4, marketNameToSUM(marketNameList, 'E40'))
  setValue(42, 4, marketNameToSUM(marketNameList, 'E43'))
  setValue(42, 10, marketNameToSUM(marketNameList, 'K43'))
  setValue(40, 5, marketNameToSUM(marketNameList, 'F41'))
  setValue(41, 5, marketNameToSUM(marketNameList, 'F42'))
  setValue(40, 7, marketNameToSUM(marketNameList, 'H41'))
  setValue(40, 14, marketNameToSUM(marketNameList, 'O41'))
}

/** 总部汇总表格处理 */
export const initExcel = (summaryTitle: string, marketDataList: any[], monthDate: string): void => {
  const marketSheets = marketDataList.map((market: { marketData: { name: string; celldata: { v: { ct: { fa: string; }; }; }[]; data: { ct: { fa: string; }; }[][]; }; marketName: string; }) => {
    const sheet = JSON.parse(JSON.stringify(market.marketData))
    sheet.name = market.marketName.replace(/-/g, '');
    sheet.zoomRatio = 1 // 重置缩放比例
    sheet.luckysheet_select_save = [] // 重置选择区域
    // 格式处理
    sheet.celldata.forEach((element: { v: { ct: { fa: string; }; }; }) => {
      if (element?.v?.ct?.fa && element.v.ct.fa === '0%') {
        element.v.ct.fa = '0.00%'
      }
    })
    sheet.data.forEach((element: { ct: { fa: string; }; }[]) => {
      element.forEach((e: { ct: { fa: string; }; }) => {
        if (e?.ct?.fa) {
          e.ct.fa === '0%' && (e.ct.fa = '0.00%')
        }
      })
    })
    sheet.scrollLeft = 0
    sheet.scrollTop = 0
    return sheet
  })
  const summaryExcel = {
    template: summaryTemplate0506,
    setValue: setTemplateValue0506
  }
  if (dayjs(Number(monthDate)).isAfter(dayjs(1717200000000))){
    // @ts-ignore
    summaryExcel.template = summaryTemplate0611
    summaryExcel.setValue = setTemplateValue0611
  }
  // 2024-05 开始使用新的汇总模板
  if (dayjs(Number(monthDate)).isAfter(dayjs(1743465600000))){
    // @ts-ignore
    summaryExcel.template = summaryTemplate20250520
    summaryExcel.setValue = setTemplateValue20250520
  }
  // 2025-12-31 08:00:00 开始使用新的汇总模板
  if (dayjs(Number(monthDate)).isAfter(dayjs(1767139200000))){
    // @ts-ignore
    summaryExcel.template = summaryTemplate20260116
    summaryExcel.setValue = setTemplateValue20260116
  }
  let summaryTemplate = summaryExcel.template
  summaryTemplate.scrollLeft = 0
  summaryTemplate.scrollTop = 0
  // @ts-expect-error
  window.luckysheet.destroy()
  // @ts-expect-error
  window.luckysheet.create({
    container: 'excel-dom',
    lang: 'zh',
    showinfobar: false,
    showtoolbar: false,
    sheetFormulaBar: true,
    enableAddRow: false,
    enableAddBackTop: false,
    data: [summaryTemplate, ...marketSheets],
    cellRightClickConfig: {
      copy: false, // 复制
      copyAs: false, // 复制为
      paste: false, // 粘贴
      insertRow: false, // 插入行
      insertColumn: false, // 插入列
      deleteRow: false, // 删除选中行
      deleteColumn: false, // 删除选中列
      deleteCell: false, // 删除单元格
      hideRow: false, // 隐藏选中行和显示选中行
      hideColumn: false, // 隐藏选中列和显示选中列
      rowHeight: false, // 行高
      columnWidth: false, // 列宽
      clear: false, // 清除内容
      matrix: false, // 矩阵操作选区
      sort: false, // 排序选区
      filter: false, // 筛选选区
      chart: false, // 图表生成
      image: false, // 插入图片
      link: false, // 插入链接
      data: false, // 数据验证
      cellFormat: false // 设置单元格格式
    }
  })
  // 汇总 sheet 动态公式
  const marketNameList = marketDataList.map((e: { marketName: string; }) => e.marketName.replace(/-/g, ''))
  setValue(0, 0, summaryTitle)
  summaryExcel.setValue(marketNameList)
}

export const downloadExcel = (file: File): void => {
  const a = document.createElement('a')
  a.download = file.name
  a.href = URL.createObjectURL(file)
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  message.success('导出成功')
}

export const getExcelFileObjet = async (title: string): Promise<File> => {
  // @ts-expect-error
  const data = window.luckysheet.getluckysheetfile()

  const marketSheets = data.map((market: any) => {
    const sheet = JSON.parse(JSON.stringify(market))
    // 格式处理 强制显示百分比
    sheet.data.forEach((element: any[]) => {
      element.forEach((e) => {
        if (e) {
          e.bg = '#ffffff' // 强制背景色为白色
          if (e.ct && e.ct.fa && e.ct.fa.includes('0.00%')) {
            e.v = e.m
            if (sheet.name === '汇总') {
              e.f = ''
            }
            if (e.f && e.f?.includes('AVERAGE')) {
              e.f = ''
            }
          }
        }
      })
    })
    return sheet
  })
  const exportData = await exportExcel(marketSheets)
  const blob = new Blob([exportData])
  const file = new File([blob], title, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  return file
}
