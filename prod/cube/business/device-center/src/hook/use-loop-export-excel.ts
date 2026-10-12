import { message } from '@ghcloud/cube-ui'
import { ref, type Ref } from 'vue'
import Excel from 'exceljs'
import dayjs from 'dayjs'
import type { TableColumn } from 'ant-design-vue'

interface UseLoopExportExcel {
  exportLoading: Ref<boolean>;
  exportData: (payload: {
    exportTotal: number; // 导出数据的总条数
    fileName: string; // 导出的文件名称
    pageSize: 1000; // 分批导出的数量
    columns: TableColumn[];
    getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: Row[]; }>; // 分批获取导出的数据函数
    headDesc?: string; // 说明行
  }) => void;
}
export interface Row {
  eventTime?: string;
  ts?: string;
  value?: string;
  valueText?: string;
  valueOfStr?: string;
}

export interface TableColumn {
  title?: string; width?: number; dataIndex?: string;unit?: string; code?: string;
}
export const useLoopExportExcel = (): UseLoopExportExcel => {
  const exportLoading = ref(false)
  let exportFileName = '导出记录'
  const tableColumns = ref<TableColumn[]>()
  const exportData = async (
    payload: {
      exportTotal: number;
      fileName: string;
      pageSize: 1000;
      columns: TableColumn[];
      getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: Row[]; }>;
      headDesc?: string;
    }
  ): Promise<void> => {
    try {
      exportLoading.value = true
      const count = Math.ceil(payload.exportTotal / payload.pageSize)
      const exportData: Row[] = []
      for (let i = 0; i < count; i++) {
        if (payload.getExportDataFunc && typeof payload.getExportDataFunc === 'function') {
          const { records } = await payload.getExportDataFunc(i + 1, payload.pageSize)
          exportData.push(...records)
        }
      }
      if (payload.fileName) exportFileName = payload.fileName
      tableColumns.value = payload.columns
      exportExcel(exportData, payload.headDesc)
    } catch {
      exportLoading.value = false
    } finally {
      exportLoading.value = false
    }
  }
  const exportExcel = async (data: Row[], headDesc?: string): Promise<void> => {
    try {
      if (data.length === 0) {
        message.warn('暂无数据')
        return
      }
      const workbook = new Excel.Workbook()
      const worksheet = workbook.addWorksheet()

      // @ts-expect-error
      worksheet.columns = tableColumns.value.map((column) => {
        return {
          header: column?.title,
          key: column?.dataIndex,
          width: column?.width || 20, // 如果没有指定宽度，则默认为20
        }
      })
      const res = data.map((item: Row) => {
        const obj: Row = { ...item }
        if (item?.ts) {
          obj.ts = item.ts ? dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
        if (item?.eventTime) {
          obj.eventTime = item.eventTime ? dayjs(item.eventTime).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
        return obj
      })
      worksheet.addRows(res)
      // 在顶部插入一行
      worksheet.spliceRows(1, 0, [headDesc])
      // 获取第一行
      const firstRow = worksheet.getRow(1)
      worksheet.mergeCells(firstRow.number, 1, firstRow.number, 10)
      firstRow.font = { bold: true, color: { argb: 'FF0000' } }
      firstRow.alignment = { vertical: 'middle', horizontal: 'left' }
      firstRow.height = 40
      firstRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFCC00' } // 黄色
        }
      })
      // 获取标题行
      const titleRow = worksheet.getRow(2)
      titleRow.font = { name: 'Arial', size: 12, bold: true, color: { argb: 'FF000000' } }

      const a = document.createElement('a')
      a.download = `${exportFileName}.xlsx`
      a.href = window.URL.createObjectURL(
        new Blob([await workbook.xlsx.writeBuffer()], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
        })
      )
      a.click()
      exportLoading.value = false
    } catch {
      exportLoading.value = false
    }
  }
  return {
    exportLoading,
    exportData
  }
}
