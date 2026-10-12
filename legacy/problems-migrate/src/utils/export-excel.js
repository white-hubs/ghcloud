import { message } from "ant-design-vue"
import moment from "moment"
import Excel from 'exceljs'
export const exportExcel = async (fileName, columns, data) => {
  if (data.length === 0) {
    message.warn('暂无数据')
    return
  }
  const workbook = new Excel.Workbook()
  const worksheet = workbook.addWorksheet()
  // @ts-expect-error
  worksheet.columns = columns.map((e) => {
    return { header: e?.title, key: e?.dataIndex, width: 30 }
  })
  const res = data.map((item) => {
    const obj = {...item}
    if(item?.submitedTime) {
      obj.submitedTime = item.submitedTime ? moment(item.submitedTime).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
    if(item?.status) {
      obj.status = item.status ? statusText(item.status) : '--'
    }
    return obj
  })

  worksheet.addRows(res)
  const a = document.createElement('a')
  a.download = `${fileName}.xlsx`
  a.href = window.URL.createObjectURL(
    new Blob([await workbook.xlsx.writeBuffer()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
  )
  a.click()
  exportLoading.value = false
}

export const statusText = (str) => {
  const statusMap = new Map([
    ["SUBMIT", "提交"],
    ["UNDO", "撤销"],
    ["REPEAT", "重新提交"],
    ["APPROVAL", "审批"],
    ["BACK", "撤回"],
    ["COPY", "抄送"],
    ["REJECT", "驳回"],
    ["FINISHED", "完成"],
  ]);
  return statusMap.get(str) || "处理中";
};