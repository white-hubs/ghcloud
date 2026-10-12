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
    // 为recordItemVOS列设置宽度为200，其他列保持默认宽度30
    if (e?.dataIndex === 'standardVOS') {
      return { header: e?.title, key: e?.dataIndex, width: 100 }
    }
    return { header: e?.title, key: e?.dataIndex, width: 30 }
  })
  const res = data.map((item) => {
    const obj = {...item}
    if(item?.time) {
      obj.time = item.time ? moment(item.time).format('YYYY-MM-DD HH:mm:ss') : '--'
    }
    if(item?.result) {
      obj.result = item.result ? resultText(item.result) : '--'
    }
    if(item?.targetCategory) {
      obj.targetCategory = item.targetCategory ? targetCategoryText(item.targetCategory) : '--'
    }
    if (item?.errorDesc) {
      let text = ''
      if (Array.isArray(item.errorDesc)) {
        item.errorDesc.map(r => {
          text += `${r}\n`
        })
      } else {
        text = item.remark
      }
      obj.errorDesc = text
    }
    // 处理recordItemVO，按照content内容格式展示异常内容
    if (item?.standardVOS && Array.isArray(item.standardVOS)) {
      let formattedContent = '';
      
      item.standardVOS.forEach(standard => {
        const errResult = standard?.itemVOS?.filter(item => item.errorValueFlag);
        if (errResult?.length > 0) {
          // 添加标准名称（将在后面设置为加粗）
          formattedContent += `**${standard.standardName}**\n`;
          
          errResult.forEach((errItem, index) => {
            // 保持序号在左前方
            formattedContent += `${index + 1}、${errItem.itemName}\n`;
            // 错误描述缩进
            formattedContent += `  ${errItem.errorDesc}\n`;
          });
        }
      });
      
      obj.standardVOS = formattedContent;
    }
    
    return obj;
  });

  worksheet.addRows(res);
  
  // 找到result列的索引
  const resultColumnIndex = columns.findIndex(col => col.dataIndex === 'result') + 1;
  // 找到recordItemVO列的索引
  const recordItemVOColumnIndex = columns.findIndex(col => col.dataIndex === 'standardVOS') + 1;
  
  // 设置单元格样式
  worksheet.eachRow((row, rowNumber) => {
    // 跳过表头行
    if (rowNumber > 1) {
      // 设置异常结果为红色
      if (resultColumnIndex > 0) {
        const cell = row.getCell(resultColumnIndex);
        if (cell.value === '异常') {
          cell.font = { color: { argb: 'FFFF0000' } };
        }
      }
      
      // 处理recordItemVO列的格式
      if (recordItemVOColumnIndex > 0) {
        const cell = row.getCell(recordItemVOColumnIndex);
        if (cell.value && typeof cell.value === 'string') {
          // 设置自动换行和垂直对齐方式
          cell.alignment = { wrapText: true, vertical: 'middle' };
          
          // 将标准名称加粗
          const lines = cell.value.split('\n');
          const richText = [];
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // 检查是否是标准名称（以**开头和结尾）
            if (line.startsWith('**') && line.endsWith('**')) {
              // 添加加粗的标准名称
              richText.push({
                text: line.substring(2, line.length - 2) + '\n',
                font: { bold: true, size: 11 }
              });
            } 
            // 检查是否是错误描述（以空格开头）
            else if (line.startsWith('  ')) {
              // 添加缩进的错误描述
              richText.push({
                text: line + '\n',
                font: { size: 11 }
              });
            }
            // 其他行（包括序号和项目名称）
            else {
              richText.push({
                text: line + '\n',
                font: { size: 11 }
              });
            }
          }
          
          // 设置富文本
          cell.value = { richText };
        }
      }
    }
    
    // 为所有单元格设置垂直居中
    row.eachCell((cell, colNumber) => {
      if (!cell.alignment) {
        cell.alignment = { wrapText: true, vertical: 'middle' };
      } else if (!cell.alignment.vertical) {
        cell.alignment.vertical = 'middle';
      }
    });
  });
  
  const a = document.createElement('a')
  a.download = `${fileName}.xlsx`
  a.href = window.URL.createObjectURL(
    new Blob([await workbook.xlsx.writeBuffer()], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    })
  )
  a.click()
}

export const resultText = (str) => {
  const statusMap = new Map([
    ["NORMAL", "正常"],
    ["ABNORMAL", "异常"],
  ]);
  return statusMap.get(str) || "";
};
export const targetCategoryText = (str) => {
  const statusMap = new Map([
    ["DEVICE", "设备"],
    ["STALL", "档位"],
    ["PROPERTY", "资产"],
    ["SITE_POINT", "现场点"],
    ["RISK_SOURCE", "风险源"],
    ['SMALL_ENGINEERING', '小散工程']
  ]);
  return statusMap.get(str) || "";
};