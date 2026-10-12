import { Button, message } from '@ghcloud/cube-ui'
import { defineComponent, ref, type PropType } from 'vue'
import dayjs from 'dayjs'
import { objectStatusColor, objectStatusMap, type InspectRecordPageExportData, type InspectRecordVo } from '@ghcloud/cube-daily-inspection-service'

export interface ExportHtmlProps {
  exportData: InspectRecordPageExportData;
  fileName?: string;
  onExport?: () => Promise<any>;
  showButton?: boolean;
}

export const ExportHtml = defineComponent({
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
        
        // 生成HTML内容
        const htmlContent = generateHtml(exportData, props.fileName)
        
        // 创建Blob并下载
        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `${props.fileName}_${dayjs().format('YYYY-MM-DD')}.html`
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        message.success('导出成功')
      } catch (error) {
        message.error('导出失败，请稍后重试')
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
    
    // 获取异常明细文本
    const getErrorText = (item: InspectRecordVo): string => {
      let errContent = '';
      if (item?.standardVOS && Array.isArray(item.standardVOS)) {
        item.standardVOS.forEach(standard => {
          const errResult = standard?.itemVOS?.filter(item => item.errorValueFlag);
          if (errResult && errResult?.length > 0) {
            errContent += `<div class="standard-name">${standard.standardName}</div>`;
            errResult.forEach((errItem, index) => {
              errContent += `<div class="result-item-list">`;
              errContent += `<div class="result-item">`;
              errContent += `<div class="first-index">${index + 1}、</div>`;
              errContent += `<div class="item-content">`;
              errContent += `<div><label>${errItem.itemName}:</label> <span class="error-value">${errItem.itemResultName || '--'}</span></div>`;
              errContent += `<div><label>描述信息:</label> <span>${errItem.errorDesc || '--'}</span></div>`;
              
              if (errItem?.fileVOS && Array.isArray(errItem.fileVOS) && errItem.fileVOS.length > 0) {
                errContent += `<div class="image-container">`;
                errItem.fileVOS.forEach(file => {
                  if (file.path) {
                    const url = file.path.startsWith('http') ? file.path : `${window.location.origin}${file.path.startsWith('/') ? '' : '/'}${file.path}`;
                    errContent += `
                      <div class="image-item">
                        <img src="${url}" class="thumbnail" onclick="showImageModal('${url}')" alt="${file.name || '图片'}" />
                      </div>
                    `;
                  }
                });
                errContent += `</div>`;
              }
              
              errContent += `</div>`;
              errContent += `</div>`;
              errContent += `</div>`;
            });
          }
        });
      }
      return errContent;
    }
    const getCancelReasonText = (item: InspectRecordVo): string => {
      let cancelContent = `<div class="item-desc">${item.cancelReason ? '取消原因:' + item.cancelReason || '--' : '--' }</div>`;
      if (item?.cancelFileList && Array.isArray(item.cancelFileList)) {
        cancelContent += `<div class="image-container">`
        item.cancelFileList.forEach(file => {
          if (file.path) {
            const url = file.path.startsWith('http') ? file.path : `${window.location.origin}${file.path.startsWith('/') ? '' : '/'}${file.path}`;
            cancelContent += `
              <div class="image-item">
                <img src="${url}" class="thumbnail" onclick="showImageModal('${url}')" alt="${file.name || '图片'}" />
              </div>
            `;
          }
        });
        cancelContent += `</div>`
      }
      return cancelContent;
    }
    
    // 生成表格行HTML
    const generateTableRows = (data: InspectRecordPageExportData): string => {
      let rowsHtml = '';
      
      data.inspectRecordList?.forEach((record, index) => {
        const resultClass = record.result === 'ABNORMAL' ? 'abnormal' : 'normal';
        const statusColor = record.status ? `color: ${objectStatusColor.get(record.status || '')}` : '';
        
        rowsHtml += `
          <tr>
            <td>${index + 1}</td>
            <td>${record.targetName || '--'}</td>
            <td>${record.inspectMethod || '--'}</td>
            <td>${record.taskName || '--'}</td>
            <td>${record.nickname || '--'}</td>
            <td>${record.organizationName || '--'}</td>
            <td>${record.time ? dayjs(record.time).format('YYYY-MM-DD HH:mm:ss') : '--'}</td>
            <td style="${statusColor}">${getStatusText(record.status)}</td>
            <td class="${resultClass}">${getResultText(record.result)}</td>
            <td class="error-detail-cell">
              ${record.errNames ? getErrorText(record) : '--'}
            </td>
            <td>${getCancelReasonText(record)}</td>
          </tr>
        `;
      });
      
      return rowsHtml;
    }
    
    // 生成HTML内容
    const generateHtml = (data: InspectRecordPageExportData, title: string): string => {
      // HTML模板
      const html = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 20px 20px 0;
              color: rgba(0, 0, 0, 0.85);
              font-size: 14px;
              height: calc(100vh - 20px);
            }
            .container {
              max-width: 100%;
              margin: 0 auto;
            }
            .header {
              margin-bottom: 12px;
            }
            .summary {
              background-color: #f5f5f5;
              padding: 12px;
              border-radius: 4px;
              margin-bottom: 12px;
            }
            .summary-item {
              display: inline-block;
              margin-right: 24px;
              margin-bottom: 8px;
            }
            .summary-label {
              margin-right: 4px;
            }
            .table-container {
              max-height: calc(100vh - 100px); 
              overflow-y: auto;
              position: relative;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            th, td {
              border: 1px solid #f0f0f0;
              padding: 12px 8px;
              text-align: center;
              word-break: break-word;
              &:first-child {
                width: 70px;
                padding: 12px 0;
              }
              &:nth-child(3), &:nth-child(8), &:nth-child(9) {
                width: 100px;
              }
              &:nth-child(10) {
                width: 240px;
              }
            }
            th {
              background-color: #fafafa;
              font-weight: 500;
              color: rgba(0, 0, 0, 0.85);
              position: sticky; /* 使表头固定 */
              top: -2px; /* 固定在容器顶部 */
              z-index: 1; /* 确保表头在内容之上 */
              padding: 15px 8px;
            }
            /* 添加表头底部边框，修复滚动时的视觉问题 */
            th:after {
              content: '';
              position: absolute;
              left: 0;
              bottom: 0;
              width: 100%;
              border-bottom: 1px solid #f0f0f0;
            }
            tr:hover {
              background-color: #fafafa;
            }
            .normal {
              color: #52c41a;
            }
            .abnormal {
              color: #ff4158;
            }
            .error-detail-cell {
              position: relative;
              cursor: pointer;
              text-align: left;
            }
            .error-detail-cell:hover .error-detail-popover {
              display: block;
            }
            .error-detail-popover {
              position: absolute;
              top: 100%;
              left: 0;
              z-index: 10;
              min-width: 300px;
              max-width: 500px;
              background-color: white;
              border: 1px solid #f0f0f0;
              border-radius: 4px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
              padding: 12px;
              text-align: left;
            }
            .hidden {
              display: none;
            }
            .standard-name {
              font-weight: bold;
              margin-bottom: 8px;
            }
            .item-detail {
              margin-bottom: 4px;
            }
            .item-desc {
              color: rgba(0, 0, 0, 0.45);
              margin-bottom: 8px;
              margin-left: 16px;
            }
            .image-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .image-item {
              width: 60px;
              height: 60px;
              overflow: hidden;
            }
            .thumbnail {
              width: 100%;
              height: 100%;
              object-fit: cover;
              cursor: pointer;

            }
            .result-item-list {
              margin-bottom: 8px;
            }
            .result-item {
              display: flex;
              gap: 4px;
              margin-bottom: 4px;
            }
            .first-index {
              white-space: nowrap;
            }
            .item-content {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }
            .error-value {
              color: red;
              margin-left: 12px;
            }
            .normal-value {
              color: green;
              margin-left: 12px;
            }
            .item-desc {
              margin-bottom: 8px;
            }
            .image-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
            }
            .image-item {
              width: 60px;
              height: 60px;
              overflow: hidden;
            }
            .thumbnail {
              width: 100%;
              height: 100%;
              object-fit: cover;
              cursor: pointer;

            }
            .detail-button {
              color: #1890ff;
              background: none;
              border: none;
              cursor: pointer;
              padding: 0;
            }
            .modal {
              display: none;
              position: fixed;
              z-index: 100;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background-color: rgba(0, 0, 0, 0.7);
            }
            .modal-content {
              margin: 10px auto;
              display: block;
              max-width: 90%;
              max-height: 90%;
            }
            .close {
              position: absolute;
              top: 20px;
              right: 30px;
              color: white;
              font-size: 40px;
              font-weight: 500;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="summary">
                <div class="summary-item">
                  <span class="summary-label">巡检对象数:</span>
                  <span>${data.total || 0}个</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">异常:</span>
                  <span>${data.abnormal || 0}个</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">正常:</span>
                  <span>${data.normal || 0}个</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">待修复:</span>
                  <span>${data.waitRepair || 0}个</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">取消修复:</span>
                  <span>${data.cancelRepair || 0}个</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">已完成:</span>
                  <span>${data.over || 0}个</span>
                </div>
              </div>
            </div>
            
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>序号</th>
                    <th>巡检对象名称</th>
                    <th>巡检方式</th>
                    <th>任务名称</th>
                    <th>巡检人员</th>
                    <th>部门</th>
                    <th>巡检时间</th>
                    <th>对象状态</th>
                    <th>结果</th>
                    <th>异常修复明细</th>
                    <th>取消修复说明</th>
                  </tr>
                </thead>
                <tbody>
                  ${generateTableRows(data)}
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 图片预览模态框 -->
          <div id="imageModal" class="modal">
            <span class="close" onclick="closeImageModal()">&times;</span>
            <img class="modal-content" id="modalImg">
          </div>
          
          <script>
            // 显示图片模态框
            function showImageModal(src) {
              document.getElementById('imageModal').style.display = 'block';
              document.getElementById('modalImg').src = src;
            }
            
            // 关闭图片模态框
            function closeImageModal() {
              document.getElementById('imageModal').style.display = 'none';
            }

          </script>
        </body>
        </html>
      `;
      
      return html;
    }
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