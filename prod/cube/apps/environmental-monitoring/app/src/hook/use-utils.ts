import { message } from 'ant-design-vue'
import Excel, { type Column } from 'exceljs'
import dayjs from 'dayjs'
import type { DeviceSamplingHistoryResult } from '@ghcloud/cube-iot-center-service'
export const exportExcel = async (params: {
  deviceName: string;
  fileName: string;
  columns: {
    title?: string;
    width?: number;
    dataIndex?: string;
    unit?: string;
    code?: string;
  }[];
  data: DeviceSamplingHistoryResult[];
}): Promise<void> => {
  if (params.data.length === 0) {
    message.warn('暂无数据')
    return
  }
  const workbook = new Excel.Workbook()
  const worksheet = workbook.addWorksheet()
  worksheet.columns = params.columns.map((e: { title?: string; dataIndex?: string; }) => {
    return { header: e?.title, key: e?.dataIndex, width: 30 }
  }) as Column[]
  const res = params.data.map((item: DeviceSamplingHistoryResult) => {
    const obj: Record<string, string> = {}
    if (item.propValues) {
      for (const k in item.propValues) {
        let value = ''
        if (item.propValues) {
          value = (item.propValues[k]?.value ?? '') as string
          value && (value += item.propValues[k].unit ?? '')
        }
        obj[k] = value ?? '--'
      }
      obj.deviceName = params.deviceName
      obj.ts = item.ts ? dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
    return obj
  })
  worksheet.addRows(res)
  const a = document.createElement('a')
  a.download = `${params.fileName}.xlsx`
  a.href = window.URL.createObjectURL(
    new Blob([await workbook.xlsx.writeBuffer()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
  )
  a.click()
}
