import { nextTick } from 'process'
import { ReportRecord } from '../types'

// 预定义的模板变量
export const TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'code', label: '报告编号', description: '报告的唯一编号' },
  { key: 'tenantName', label: '受检单位', description: '受检单位"' },
  { key: 'tenantAddress', label: '受检地址', description: '受检地址"' },
  { key: 'area', label: '检测区域', description: '检测区域地址' },
  { key: 'statement', label: '检测声明', description: '检测声明' },
  { key: 'company', label: '检测公司', description: '检测公司的名称' },
  { key: 'companyAddress', label: '检测地址', description: '检测公司地址' },
  { key: 'phone', label: '检测电话', description: '检测电话' },
  { key: 'detectionDate', label: '检测日期', description: '检测日期' },
  { key: 'propertyName', label: '检测项目', description: '检测项目' },
  { key: 'basicName', label: '检测依据', description: '检测依据' },
  { key: 'resultAppraise', label: '结果评价', description: '结果评价' },
  { key: 'createTime', label: '签发日期', description: '签发日期' },
]

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

// 预定义默认模版
export const getDefaultTemplate = (): string => {
  
  const temp = "<p style=\"text-align: center;\"><img src=\"/minio/medical-cleanliness/1946116334771879937.png\" alt=\"\" data-href=\"\" style=\"width: 332.00px;height: 140.77px;\"></p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\"><br></p><h2 style=\"text-align: center; fontWeight: bold;\"><strong>检验检测报告</strong></h2><p><br></p><p><br></p><p><br></p><p style=\"text-align: center;\">报告编号：{{code}}</p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\"><br></p><table style=\"width: 100%;\"><tbody><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>受检单位:<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>{{tenantName}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>检测区域:<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>{{area}}<br></td></tr></tbody></table><p><br></p><table style=\"width: 100%;\"><tbody><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9; \"><br>{{company}}</td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: left; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>声明：<br>一、本报告只涉及系统质量控制。<br>二、本报告不涉及司法报告。<br>三、报告涂改、部分复制无效。<br>四、最终解释权由成都洁定医疗检测技术有限公司所有。<br><br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: left; line-height: 1.5; border: 1px solid #d9d9d9;\"><br><table style=\"width: 100%;\"><tr><td style=\"border: none;\">地址：{{companyAddress}}</td><td style=\"border: none;\">电话：{{phone}}</td></tr></table></td></tr></tbody></table><p><br></p><p><br></p><p><br></p><table style=\"width: 100%;\"><tbody><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>委托单位<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>{{tenantName}}<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>收样日期<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>联系方式<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>检测日期<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>{{detectionDate}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>委托单位地址&nbsp;&nbsp;<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>受检状态<br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>实时动态<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>受检地址<br></td><td colspan=\"3\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>{{tenantAddress}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>检测项目<br></td><td colspan=\"3\" rowspan=\"1\" style=\"text-align: left; line-height: 1.2; border: 1px solid #d9d9d9;\"><br>{{propertyName}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>检测依据</td><td colspan=\"3\" rowspan=\"1\" style=\"text-align: left; line-height: 1.2; border: 1px solid #d9d9d9;\"><br>{{basicName}}</td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>结果评价<br></td><td colspan=\"3\" rowspan=\"1\" style=\"text-align: left; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>{{resultAppraise}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>备注<br></td><td colspan=\"3\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br>报告中的\"——\"表示此项不适用，报告中\"/\"表示此项空白。<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br><br>检测<br><br></td><td colspan=\"3\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br><br>批准<br><br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br><br>技术负责人<br><br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"></td></tr><tr><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9; letter-spacing: 4px;\"><br><br>审核<br><br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br><br>签发日期<br><br></td><td colspan=\"1\" rowspan=\"1\" style=\"text-align: center; line-height: 1.5; border: 1px solid #d9d9d9;\"><br><br>{{createTime}}<br><br></td></tr></tbody></table><p><br></p>"
  
  // 编辑器把temp默认模版保存一遍后，返回temp2。此时使用tmp2生成pdf会报错。
  const temp2 = "<p style=\"text-align: center;\"><img src=\"/minio/medical-cleanliness/1946116334771879937.png\" alt=\"\" data-href=\"\" style=\"width: 332.00px;height: 140.77px;\"></p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\"><br></p><h2 style=\"text-align: center;\"><strong>检验检测报告</strong></h2><p><br></p><p><br></p><p><br></p><p style=\"text-align: center;\">报告编号：{{code}}</p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\"><br></p><p style=\"text-align: center;\"><br></p><table style=\"width: 100%;\"><tbody><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>受检单位:<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>{{tenantName}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>检测区域:<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>{{area}}<br></td></tr></tbody></table><p><br></p><table style=\"width: 100%;\"><tbody><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>{{company}}</td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: left; line-height: 1.5;\"><br>声明：<br>一、本报告只涉及系统质量控制。<br>二、本报告不涉及司法报告。<br>三、报告涂改、部分复制无效。<br>四、最终解释权由成都洁定医疗检测技术有限公司所有。<br><br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: left; line-height: 1.5;\"><br></td></tr><tr><td colSpan=\"1\" rowSpan=\"1\" width=\"auto\">地址：{{companyAddress}}</td><td colSpan=\"1\" rowSpan=\"1\" width=\"auto\">电话：{{phone}}</td></tr></tbody></table><p><br></p><p><br></p><p><br></p><table style=\"width: 100%;\"><tbody><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>委托单位<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>{{tenantName}}<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>收样日期<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>联系方式<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>检测日期<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>{{detectionDate}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>委托单位地址 &nbsp;<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>受检状态<br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>实时动态<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>受检地址<br></td><td colspan=\"3\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>{{tenantAddress}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>检测项目<br></td><td colspan=\"3\" rowspan=\"1\" width=\"auto\" style=\"text-align: left;\"><br>{{propertyName}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>检测依据</td><td colspan=\"3\" rowspan=\"1\" width=\"auto\" style=\"text-align: left;\"><br>{{basicName}}</td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>结果评价<br></td><td colspan=\"3\" rowspan=\"1\" width=\"auto\" style=\"text-align: left; line-height: 1.5;\"><br>{{resultAppraise}}<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>备注<br></td><td colspan=\"3\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br>报告中的\"——\"表示此项不适用，报告中\"/\"表示此项空白。<br></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br><br>检测<br><br></td><td colspan=\"3\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br><br>批准<br><br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br><br>技术负责人<br><br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"></td></tr><tr><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br><br>审核<br><br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br><br>签发日期<br><br></td><td colspan=\"1\" rowspan=\"1\" width=\"auto\" style=\"text-align: center; line-height: 1.5;\"><br><br>{{createTime}}<br><br></td></tr></tbody></table><p><br></p>"

  return temp2
}

// 修正模版结构
export const correctTemplate = (template: string): string => { 
  let newTemp = template

  try {
    // 1. 给td设置边框样式
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = template;
    const tdElements = tempDiv.querySelectorAll('td');
    tdElements.forEach(td => {
      const style = td.getAttribute('style') || '';
      if (!style.includes('border:') && !style.includes('border-')) {
        td.setAttribute('style', `${style}; border: 1px solid #d9d9d9;`);
      }
    });

    // 2. 查找声明前一行td中是否存在company，如果没有则需要设置<br><h3>{{company}}</h3>
    const tableRows = tempDiv.querySelectorAll('tr');
    for (let index = 0; index < tableRows.length; index++) {
      const row = tableRows[index];
      const rowHtml = row.innerHTML;
      if (rowHtml.includes('声明：')) {
        if (index > 0) {
          const prevRow = tableRows[index - 1];
          const prevRowHtml = prevRow.innerHTML;
          if (!prevRowHtml.includes('{{company}}') || !prevRowHtml.includes('<h3')) {
            const firstCell = prevRow.querySelector('td');
            if (firstCell) {
              const originalContent = firstCell.innerHTML;
              const tdStyle = firstCell.getAttribute('style') || '';
              const h3Style = 'text-align: center; line-height: 1.5; font-size: 24px;';
              if (!originalContent.includes('<h3>')) {
                if (originalContent.trim() === '' || originalContent.trim() === '<br>') {
                  firstCell.innerHTML = `<br><h3 style="${h3Style}">{{company}}</h3>`;
                } else {
                  firstCell.innerHTML = `<br><h3 style="${h3Style}">{{company}}</h3>`;
                  // firstCell.innerHTML = `<br><h3 style="${h3Style}">{{company}}${originalContent}</h3>`;
                }
              }
              if (!tdStyle.includes('border:') && !tdStyle.includes('border-')) {
                firstCell.setAttribute('style', `${tdStyle}; border: 1px solid #d9d9d9; font-size: 24px;`);
              }
            }
          }
        }
      }
    }

    // 3. 查找包含地址和电话的行，但不包含嵌套表格的结构
    tableRows.forEach(row => {
      const rowHtml = row.innerHTML;
      if (rowHtml.includes('地址：{{companyAddress}}') &&
          rowHtml.includes('电话：{{phone}}') &&
          !rowHtml.includes('<table')) {
        const addressCell = row.querySelector('td[colspan="1"][rowspan="1"]:nth-child(1)');
        const phoneCell = row.querySelector('td[colspan="1"][rowspan="1"]:nth-child(2)');

        if (addressCell && phoneCell) {
          const addressContent = addressCell.innerHTML;
          const phoneContent = phoneCell.innerHTML;
          const newCell = document.createElement('td');
          newCell.setAttribute('colspan', '1');
          newCell.setAttribute('rowspan', '1');
          newCell.setAttribute('style', 'text-align: left; line-height: 1.5; border: 1px solid #d9d9d9;');
          newCell.innerHTML = `<table style="width: 100%;"><tr><td style="border: none; width: 70%;">${addressContent}</td><td style="border: none;">${phoneContent}</td></tr></table>`;
          row.innerHTML = '';
          row.appendChild(newCell);
          
          // 检查并删除前面的空行
          const prevRow = row.previousElementSibling;
          if (prevRow && prevRow.innerHTML.includes('<br>') && prevRow.parentNode &&
              prevRow.querySelector('td[colspan="1"][rowspan="1"][style*="text-align: left; line-height: 1.5;"]')) {
            prevRow.parentNode.removeChild(prevRow);
          }
        }
      }
    });
    // 4. 查找声明行的下一行，如果有空行则去掉。
    tableRows.forEach((row, index) => {
      const rowHtml = row.innerHTML;
      if (rowHtml.includes('声明：') && index < tableRows.length - 1) {
        // 获取声明行的下一行
        const nextRow = tableRows[index + 1];
        // 检查下一行是否为空行
        if (nextRow && nextRow.parentNode) {
          const nextRowCell = nextRow.querySelector('td');
          if (nextRowCell && 
              (nextRowCell.innerHTML.trim() === '' || 
               nextRowCell.innerHTML.trim() === '<br>')) {
            // 删除空行
            nextRow.parentNode.removeChild(nextRow);
          }
        }
      }
    });
    // 5. 去掉模版中样式 width=\"auto\"
    const allElements = tempDiv.querySelectorAll('*[width="auto"]');
    allElements.forEach((element: { removeAttribute: (arg0: string) => void }) => {
      element.removeAttribute('width');
    });
    newTemp = tempDiv.innerHTML;
  } catch (error) {
  }
  return newTemp
}

export const checkboxData = "data:image/jpeg;base64,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"

export const defaultImageData = "data:image/png;base64,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"