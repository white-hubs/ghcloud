import { message } from 'ant-design-vue'
import Excel from 'exceljs'
import { type Ref, ref } from 'vue'
interface ColumnsVo {
  header: string; // 对应表格列的title
  key: string; // 对应表格列的dataIndex
}
/**
 * 前端获取数据，导出Excel（不调用导出接口）
 * @param payload { dataSource: T[], fileName: string, columns: ColumnsVo[] }
 */
export const tableExportExcel = async <T>(payload: {
  dataSource: T[];
  fileName: string;
  columns: ColumnsVo[];
}): Promise<void> => {
  const workBook = new Excel.Workbook()
  const workSheet = workBook.addWorksheet()
  workSheet.columns = payload.columns.map(item => {
    return {
      ...item,
      width: 20,
    }
  }) as unknown as typeof workSheet.columns
  workSheet.addRows(payload.dataSource)
  workSheet.getRow(1).font = { bold: true }
  // 设置第一行表头样式加粗背景
  for (let index = 0; index < payload.columns.length; index++) {
    workSheet.getRow(1).getCell(index + 1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE4E4E4' },
    }
  }
  workSheet.getRow(1).height = 30
  const rowNum = workSheet.lastRow?.number as unknown as number
  if (rowNum) {
  // 增加单元格边框
    for (let num = 0; num < rowNum; num++) {
      for (let index = 0; index < payload.columns.length; index++) {
        workSheet.getRow(num + 1).getCell(index + 1).alignment = { vertical: 'middle', horizontal: 'center' }
        workSheet.getRow(num + 1).getCell(index + 1).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        }
      }
    }
  }

  const a = document.createElement('a')
  a.download = `${payload.fileName}.xlsx`
  a.href = window.URL.createObjectURL(
    new Blob([await workBook.xlsx.writeBuffer()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
  )
  a.click()
}

interface UseDownloadExcel {
  downLoading: Ref<boolean>;
  handleDownload: () => Promise<void>;
}
/**
 * 调用导出接口，下载Excel文件
 * @param params { exportServiceApi: () => Promise<Blob>, fileName: string }
 */
export const useDownloadExcel = (params: {
  exportServiceApi: () => Promise<Blob>;
  fileName: Ref<string> | string;
}): UseDownloadExcel => {
  const downLoading = ref(false)
  const handleDownload = async (): Promise<void> => {
    try {
      downLoading.value = true
      const res = await params.exportServiceApi()
      const blob = new Blob([res], {
        type: 'application/xls;charset-UTF-8',
      })
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `${typeof params.fileName === 'string' ? params.fileName : params.fileName.value}.xlsx`
      a.style.display = 'none'
      a.click()
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      message.error((error as { errorMessage: string; })?.errorMessage ?? '网络异常')
    } finally {
      downLoading.value = false
    }
  }

  return {
    downLoading,
    handleDownload
  }
}