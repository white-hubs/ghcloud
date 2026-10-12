import { Button, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, type PropType } from 'vue'
import Excel from 'exceljs'
import dayjs from 'dayjs'
import { objectStatusMap, type InspectRecordPageExportData, type InspectRecordVo } from '@ghcloud/cube-daily-inspection-service'

export interface ExportReportProps {
  exportData: InspectRecordPageExportData;
  fileName?: string;
  onExport?: () => Promise<any>;
}

export const ExportReport = defineComponent({
  props: {
    exportData: {
      type: Object as PropType<InspectRecordPageExportData>,
      default: () => ({})
    },
    fileName: {
      type: String,
      default: '巡检记录'
    },
    onExport: {
      type: Function,
      default: null
    },
    showButton: {
      type: Boolean,
      default: false
    }
  },
  setup(props, {expose}) {
    const exportLoading = ref(false)

    const handleExport = async (data?: InspectRecordPageExportData): Promise<void> => {
      try {
        exportLoading.value = true
        
        let exportData = data || props.exportData
        if (props.onExport && typeof props.onExport === 'function') {
          exportData = await props.onExport()
        }
        
        if (!exportData || !exportData.inspectRecordList || exportData.inspectRecordList.length === 0) {
          message.warning('暂无数据可导出')
          return
        }
        
        const workbook = new Excel.Workbook()
        const worksheet = workbook.addWorksheet('巡检记录')
        
        // 设置表头
        const headerRow = [
          '巡检对象名称',
          '巡检方式',
          '任务名称',
          '巡检人员',
          '部门',
          '巡检时间',
          '对象状态',
          '结果',
          '异常明细',
          '异常明细图片',
          '取消修复原因'
        ]
        worksheet.addRow(headerRow)
        
        const headerRowObj = worksheet.getRow(1)
        headerRowObj.font = { bold: true }
        headerRowObj.height = 25
        headerRowObj.alignment = { vertical: 'middle', horizontal: 'center' }
        
        message.loading('正在处理图片，请稍候...', 0) // 显示加载提示，0表示不自动关闭
        
        const imageProcessingPromises: Promise<void>[] = []
        
        // 处理每一行数据
        exportData.inspectRecordList.forEach((record: InspectRecordVo) => {
          const row = worksheet.addRow([
            record.targetName || '',
            record.inspectMethod || '',
            record.taskName || '',
            record.nickname || '',
            record.organizationName || '',
            record.time ? dayjs(record.time).format('YYYY-MM-DD HH:mm:ss') : '',
            getStatusText(record.status),
            getResultText(record.result),
            '', // 异常明细
            '', // 异常明细图片（新增列）
            '' // 取消修复原因
          ])
          
          // 设置所有单元格垂直居中
          row.eachCell((cell) => {
            cell.alignment = { vertical: 'middle' };
          });
          
          // 设置异常结果为红色
          if (record.result === 'ABNORMAL') {
            const resultCell = row.getCell(8); // 结果列是第8列
            resultCell.font = { color: { argb: 'FFFF0000' } }; // 设置红色
          }
          
          // 处理异常明细单元格
          const errorCell = row.getCell(9); 
          errorCell.value = getErrorText(record);
          errorCell.alignment = { wrapText: true, vertical: 'top' };
          
          // 处理异常明细图片单元格
          const errorImageCell = row.getCell(10);
          errorImageCell.alignment = { wrapText: true, vertical: 'top' };
          
          // 处理异常修复单元格
          const cancelReasonCell = row.getCell(11);
          cancelReasonCell.value = getCancelReason(record);
          cancelReasonCell.alignment = { wrapText: true, vertical: 'top' };
          
          // 处理图片插入
          const imagePromise = handleImageInsert(record, worksheet, workbook, row.number)
          imageProcessingPromises.push(imagePromise)
        })
        
        // 设置列宽
        worksheet.columns.forEach((column: any, index: number) => {
          let width = 20
          if (index === 8 || index === 9 || index === 10) {
            width = 50
          } else if (index === 0 || index === 2) {
            width = 30
          }
          column.width = width
        })
        worksheet.addRow([])
        
        // 添加总计行
        const totalRow = worksheet.addRow(['总计', `巡检对象数：\n${exportData.total || 0}个`, '', ''])
        totalRow.getCell(1).font = { bold: true }
        
        // 添加统计行
        const abnormalRow = worksheet.addRow(['', '', `异常：${exportData.abnormal || 0}个`, ''])
        const waitRepairRow = worksheet.addRow(['', '', '', `待修复：${exportData.waitRepair || 0}个`])
        const cancelRepairRow = worksheet.addRow(['', '', '', `取消修复：${exportData.cancelRepair || 0}个`])
        const overRow = worksheet.addRow(['', '', '', `已完成：${exportData.over || 0}个`])
        const normalRow = worksheet.addRow(['', '', `正常：${exportData.normal || 0}个`, ''])
        
        // 设置行高，确保所有行高一致
        const rowHeight = 25
        for (let i = 0; i < 6; i++) {
          worksheet.getRow(totalRow.number + i).height = rowHeight
        }
        
        // 设置单元格对齐方式
        worksheet.getCell(`B${totalRow.number}`).alignment = { 
          vertical: 'middle', 
          horizontal: 'left',
          wrapText: true
        }
        
        // 合并A列的所有"总计"单元格
        worksheet.mergeCells(totalRow.number, 1, normalRow.number, 1)
        worksheet.getCell(`A${totalRow.number}`).alignment = { vertical: 'middle', horizontal: 'center' }
        
        // 合并B列的所有"巡检对象数"单元格
        worksheet.mergeCells(totalRow.number, 2, normalRow.number, 2)
        worksheet.getCell(`B${totalRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' }
        
        // 合并C列的"异常"单元格
        worksheet.mergeCells(abnormalRow.number, 3, waitRepairRow.number - 1, 3)
        worksheet.getCell(`C${abnormalRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' }
        
        // 合并C列的"正常"单元格
        worksheet.mergeCells(normalRow.number, 3, normalRow.number, 3)
        worksheet.getCell(`C${normalRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' }
        
        // 设置D列的单元格对齐方式
        if (worksheet.getColumn(4)) {
          worksheet.getCell(`D${waitRepairRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' }
          worksheet.getCell(`D${cancelRepairRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' }
          worksheet.getCell(`D${overRow.number}`).alignment = { vertical: 'middle', horizontal: 'left' }
        }
        
        // 添加空行
        for (let i = 1; i <= 5; i++) {
          worksheet.addRow(['', '', '', ''])
        }
        

        await Promise.all(imageProcessingPromises)
        
        message.destroy()
        const buffer = await workbook.xlsx.writeBuffer()
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        })
        
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${props.fileName}_${dayjs().format('YYYY-MM-DD')}.xlsx`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        message.success('导出成功')
      } catch (error) {
        message.error('导出失败，请稍后重试')
        message.destroy()
      } finally {
        exportLoading.value = false
      }
    }
    
    // 获取状态文本
    const getStatusText = (status: string): string => {
      const textVal = status ? objectStatusMap.get(status) || '' : ''
      return textVal
    }
    
    // 获取结果文本
    const getResultText = (result: string): string => {
      const resultMap: Record<string, string> = {
        'NORMAL': '正常',
        'ABNORMAL': '异常'
      }
      return resultMap[result] || result || ''
    }
    
    // 获取取消修复原因文本
    const getCancelReason = (record: InspectRecordVo): string => {
      return record.cancelReason || ''
    }
    
    // 获取异常明细文本
    const getErrorText = (item: InspectRecordVo): string => {
      let errContent = '';
      if (item?.standardVOS && Array.isArray(item.standardVOS)) {
        item.standardVOS.forEach(standard => {
          const errResult = standard?.itemVOS?.filter(item => item.errorValueFlag);
          if (errResult && errResult?.length > 0) {
            errContent += `${standard.standardName}\n`;
            errResult.forEach((errItem, index) => {
              errContent += `${index + 1}、${errItem.itemName}\n`;
              errContent += ` ${errItem.errorDesc || ''}\n`;
            });
          }
        });
      }
      return errContent;
    }
    
    // 处理图片插入
    const handleImageInsert = async (record: InspectRecordVo, worksheet: Excel.Worksheet, workbook: Excel.Workbook, rowIndex: number): Promise<void> => {
      // 图片位置跟踪
      const imagePositions = {
        errorDetails: { // 异常明细列（仅保留文字）
          col: 9,
          currentRow: rowIndex,
          imagesInRow: 0,
          maxImagesPerRow: 3 // 每行最多放置3张图片
        },
        errorImages: { // 异常明细图片列（新增）
          col: 10,
          currentRow: rowIndex,
          imagesInRow: 0,
          maxImagesPerRow: 3 // 每行最多放置3张图片
        },
        repairInfo: { // 异常修复列
          col: 11, // 列号调整为11
          currentRow: rowIndex,
          imagesInRow: 0,
          maxImagesPerRow: 3 // 每行最多放置3张图片
        }
      };
      
      // 插入图片的函数
      const insertImage = async (url: string, positionKey: 'errorDetails' | 'errorImages' | 'repairInfo', itemIndex: number = 0) => {
        try {
          const base64Data = await getImageBase64(url);
          if (!base64Data) return false;
          
          // 尝试多种图片格式
          const formats = ['png', 'jpeg', 'jpg', 'gif'];
          let imageId = null;
          
          for (const format of formats) {
            try {
              imageId = workbook.addImage({
                base64: base64Data,
                extension: format,
              });
              break;
            } catch (error) {
              continue;
            }
          }
          
          if (imageId !== null) {
            const position = imagePositions[positionKey];
            
            // 检查当前行的图片数量，如果达到最大值，则移到下一行
            if (position.imagesInRow >= position.maxImagesPerRow) {
              position.currentRow += 1;
              position.imagesInRow = 0;
              
              // 插入新行
              if (position.currentRow > rowIndex) {
                worksheet.spliceRows(position.currentRow, 0, ['']);
              }
            }
            
            // 计算图片在行中的水平位置
            const imageWidth = 60; // 图片宽度
            // 添加图片
            worksheet.addImage(imageId, {
              tl: { 
                col: position.col - 1 + (position.imagesInRow * 0.5) + (itemIndex * 0.1),
                row: position.currentRow - 1 
              },
              ext: { width: 60, height: 60 },
              editAs: 'oneCell'
            });
            
            // 更新行高
            const imageRow = worksheet.getRow(position.currentRow);
            imageRow.height = Math.max(imageRow.height || 0, 64);
            // 更新图片计数
            position.imagesInRow += 1;
            
            return true;
          }
        } catch (error) {
          return false;
        }
        return false;
      };
      
      // 处理异常明细中的图片
      if (record?.standardVOS && Array.isArray(record.standardVOS)) {
        let itemIndex = 0;
        for (const standard of record.standardVOS) {
          const errResult = standard?.itemVOS?.filter(item => item.errorValueFlag);
          if (errResult && errResult?.length > 0) {
            for (const errItem of errResult) {
              // 为每个异常项分配一个索引
              const currentItemIndex = itemIndex++;
              
              if (errItem?.fileVOS && Array.isArray(errItem.fileVOS)) {
                for (const file of errItem.fileVOS) {
                  if (file.path) {
                    const url = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path.startsWith('/') ? '' : '/'}${file.path}`;
                    // 修改这里，将图片插入到errorImages列而不是errorDetails列
                    await insertImage(url, 'errorImages', currentItemIndex);
                  }
                }
              }
            }
          }
        }
      }
      
      // 处理异常修复中的图片
      // if (record?.cancelFileList && Array.isArray(record.cancelFileList)) {
      //   for (const file of record.cancelFileList) {
      //     if (file.path) {
      //       const url = file.path?.startsWith('http') ? file.path : `${window.location.origin}${file.path.startsWith('/') ? '' : '/'}${file.path}`;
      //       await insertImage(url, 'repairInfo');
      //     }
      //   }
      // }
      
      // 确保所有单元格都有正确的对齐方式
      const cell9 = worksheet.getCell(rowIndex, 9);
      const cell10 = worksheet.getCell(rowIndex, 10);
      const cell11 = worksheet.getCell(rowIndex, 11);
      cell9.alignment = { wrapText: true, vertical: 'top' };
      cell10.alignment = { wrapText: true, vertical: 'top' };
      cell11.alignment = { wrapText: true, vertical: 'top' };
    };
    
    // 将图片URL转换为base64
    const getImageBase64 = async (url: string): Promise<string | null> => {
      return new Promise((resolve, reject) => {
        try {
          const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = function() {
            try {
              const canvas = document.createElement('canvas');
              // 使用更合适的尺寸，保持图片清晰度但不过大
              const maxSize = 200;
              let width = img.width;
              let height = img.height;
              
              // 保持宽高比例
              if (width > height) {
                if (width > maxSize) {
                  height = Math.round(height * (maxSize / width));
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = Math.round(width * (maxSize / height));
                  height = maxSize;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0, width, height);
              
              // 提高导出图片的质量
              const dataURL = canvas.toDataURL('image/png', 0.9);
              const base64Data = dataURL.split(',')[1];
              resolve(base64Data);
            } catch (error) {
              reject(error);
            }
          };
          
          img.onerror = function(error) {
            reject(new Error('图片加载失败'));
          };
          
          img.src = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}t=${new Date().getTime()}`;
        } catch (error) {
          reject(error);
        }
      });
    };
    
    expose({
      handleExport
    })
    return () => (
      <>
        {
          props.showButton && 
          <Button 
            type="primary" 
            onClick={handleExport} 
            loading={exportLoading.value}
          >
            导出
          </Button>
          
        }
      </>
    )
  }
})