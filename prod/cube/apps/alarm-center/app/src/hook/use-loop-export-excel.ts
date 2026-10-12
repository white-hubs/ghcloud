import { message } from '@ghcloud/cube-ui'
import { ref, type Ref } from 'vue'
import Excel from 'exceljs'
import dayjs from 'dayjs'
import type { TableColumn } from 'ant-design-vue'
import type { AlarmRecord } from '@ghcloud/cube-alarm-center-service/src/types/alarm-center'

interface UseLoopExportExcel {
  exportLoading: Ref<boolean>;
  exportData: (payload: {
    exportTotal: number; // 导出数据的总条数
    fileName: string; // 导出的文件名称
    pageSize: 1000; // 分批导出的数量
    columns: TableColumn[];
    getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: AlarmRecord[]; }>; // 分批获取导出的数据函数
  }) => void;
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
      getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: AlarmRecord[]; }>;
    }
  ): Promise<void> => {
    try {
      exportLoading.value = true
      const count = Math.ceil(payload.exportTotal / payload.pageSize)
      const exportData: AlarmRecord[] = []
      for (let i = 0; i < count; i++) {
        if (payload.getExportDataFunc && typeof payload.getExportDataFunc === 'function') {
          const { records } = await payload.getExportDataFunc(i + 1, payload.pageSize)
          exportData.push(...records)
        }
      }
      if (payload.fileName) exportFileName = payload.fileName
      tableColumns.value = payload.columns
      exportExcel(exportData)
    } catch (error) {
      exportLoading.value = false
      message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
    } finally {
      exportLoading.value = false
    }
  }
  const exportExcel = async (data: AlarmRecord[]): Promise<void> => {
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
          width: 20, // 如果没有指定宽度，则默认为20
        }
      })
      const res = data.map((item: AlarmRecord) => {
        const obj: AlarmRecord = { ...item }
        if (item?.alarmTime) {
          obj.alarmTime = item.alarmTime ? dayjs(item.alarmTime).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
        return obj
      })
      worksheet.addRows(res)
      // 获取标题行
      const titleRow = worksheet.getRow(1)
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
    } catch (error) {
      exportLoading.value = false
      message.error((error as { errorMessage: string; })?.errorMessage ?? '操作失败')
    }
  }
  return {
    exportLoading,
    exportData
  }
}
