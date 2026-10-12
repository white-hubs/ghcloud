import { message } from '@ghcloud/cube-ui'
import { ref, type Ref } from 'vue'
import Excel from 'exceljs'
import dayjs from 'dayjs'
import { DeviceStatusOptions, type MedicalNormRecord, type MedicalOverrunAlarmHistoryRecordVO } from '@ghcloud/cube-operating-room-service'

interface UseLoopExportExcel {
  exportLoading: Ref<boolean>;
  exportData: (payload: {
    exportTotal: number; // 导出数据的总条数
    fileName: string; // 导出的文件名称
    pageSize: 1000; // 分批导出的数量
    columns: TableColumn[];
    getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: MedicalOverrunAlarmHistoryRecordVO[]; }>; // 分批获取导出的数据函数
  }) => Promise<void>;
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
      getExportDataFunc: (pageNumber: number, pageSize: number) => Promise<{ records: MedicalOverrunAlarmHistoryRecordVO[]; }>;
    }
  ): Promise<void> => {
    try {
      exportLoading.value = true
      const count = Math.ceil(payload.exportTotal / payload.pageSize)
      const exportData: MedicalOverrunAlarmHistoryRecordVO[] = []
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
  const exportExcel = async (data: MedicalOverrunAlarmHistoryRecordVO[]): Promise<void> => {
    try {
      if (data.length === 0) {
        message.warn('暂无数据')
        return
      }
      const workbook = new Excel.Workbook()
      const worksheet = workbook.addWorksheet()

      // @ts-expect-error
      worksheet.columns = tableColumns.value.map((e) => {
        return { header: e?.title, key: e?.dataIndex, width: 20 }
      })
      const res = data.map((item: MedicalOverrunAlarmHistoryRecordVO) => {
        const obj: Record<string, unknown> = { ...item }
        if (item.status) {
          obj.status = DeviceStatusOptions.find(s => s.value === item?.status)?.label
        }
        if (item.recordData) {
          item.recordData.forEach((record: MedicalNormRecord) => {
            const value = record.value ? `${record.value}${record.unit ?? ''}` : '--'
            obj[record.normCode ?? ''] = value
          })
          obj.monitoringTime = item.monitoringTime ? dayjs(item.monitoringTime).format('YYYY-MM-DD HH:mm:ss') : '--'
        }
        obj.recordData && delete obj.recordData
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
    } catch (error) {
      exportLoading.value = false
    }
  }
  return {
    exportLoading,
    exportData
  }
}
