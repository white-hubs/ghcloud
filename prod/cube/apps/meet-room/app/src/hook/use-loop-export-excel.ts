import { message } from '@ghcloud/cube-ui'
import { ref, type Ref } from 'vue'
import Excel from 'exceljs'
import dayjs from 'dayjs'

interface UseLoopExportExcel {
  exportLoading: Ref<boolean>;
  exportData: (payload: {
    exportTotal: number; // 导出数据的总条数
    fileName: string; // 导出的文件名称
    pageSize: 999; // 分批导出的数量
    columns: TableColumn[];
    getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: unknown[]; }>; // 分批获取导出的数据函数
  }) => Promise<void>;
}
const options = ref([
  { value: 'APPOINTMENT', label: '已预约' },
  { value: 'APPOINTMENT_IN', label: '预约中' },
  { value: 'CANCEL_RESERVATION', label: '已取消' },
])
export interface TableColumn {
  title?: string; width?: number; dataIndex?: string;unit?: string; code?: string;
}
export const useLoopExportExcel = (): UseLoopExportExcel => {
  const exportLoading = ref(false)
  let exportFileName = '导出记录'
  const tableColumns = ref<TableColumn[]>()
  const exportExcel = async (data: unknown[]): Promise<void> => {
    try {
      if (data.length === 0) {
        message.warn('暂无数据')
        return
      }
      const workbook = new Excel.Workbook()
      const worksheet = workbook.addWorksheet()

      // @ts-expect-error
      worksheet.columns = tableColumns.value?.slice(0, -1).map((e) => {
        return { header: e?.title, key: e?.dataIndex, width: 20 }
      })
      const res = data.map((item: unknown, i) => {
        const obj: Record<string, unknown> = { ...item as Record<string, unknown> }
        if ((item as { operate: string; })?.operate) {
          obj.operate = options.value.find(e => e.value === (item as { operate: string; })?.operate)?.label
        }
        if ((item as { createTime: string; })?.createTime) {
          obj.createTime = dayjs((item as { createTime: string; }).createTime).format('YYYY-MM-DD HH:mm:ss')
        }
        if (tableColumns.value?.some(e => e.dataIndex === 'idx')){
          obj.idx = `${Number(i) + 1}`
        }
        return obj
      })
      worksheet.addRows(res)
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
  const exportData = async (
    payload: {
      exportTotal: number;
      fileName: string;
      pageSize: 999;
      columns: TableColumn[];
      getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: unknown[]; }>;
    }
  ): Promise<void> => {
    try {
      exportLoading.value = true
      const count = Math.ceil(payload.exportTotal / payload.pageSize)
      const exportData: unknown[] = []
      for (let i = 0; i < count; i++) {
        if (payload.getExportDataFunc && typeof payload.getExportDataFunc === 'function') {
          const { records } = await payload.getExportDataFunc(i + 1, payload.pageSize)
          exportData.push(...records)
        }
      }
      if (payload.fileName) exportFileName = payload.fileName
      tableColumns.value = payload.columns
      exportExcel(exportData)
    } catch {
    } finally {
      exportLoading.value = false
    }
  }

  return {
    exportLoading,
    exportData
  }
}

