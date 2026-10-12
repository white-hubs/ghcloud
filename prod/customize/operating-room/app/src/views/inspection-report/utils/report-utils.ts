import dayjs from 'dayjs'
import { checkboxData, correctTemplate, defaultImageData, getDefaultTemplate, type ReportRecord, type ReportStampInfoDTO } from '@ghcloud/cube-operating-room-service'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from './vfs-fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'

pdfMake.fonts = {
  Roboto: {
    normal: "FangSong.TTF",
    bold: "FangSong.TTF",
    italics: "FangSong.TTF",
    bolditalics: "FangSong.TTF",
  },
  FangSong: {
    normal: "FangSong.TTF",
    bold: "FangSong.TTF",
    italics: "FangSong.TTF",
    bolditalics: "FangSong.TTF",
  },
}
pdfMake.vfs = pdfFonts;

/**
 * 生成PDF报告并返回相关数据
 * @param reportData 报告数据
 * @param resultRows 检测结果行数据
 * @param progressCallback 进度回调函数
 * @param customTemplate 自定义模板（可选）
 * @returns 返回生成的PDF数据，包括blob和url
 */
export const generatePDFReport = async (
  reportData: Partial<ReportRecord>,
  resultRows: ReportStampInfoDTO[] = [],
  progressCallback?: (progress: number) => void,
  customTemplate?: string,
  watermarkImg?: string
): Promise<{ blob: Blob; url: string; filename: string; }> => {
  let template = '<p>无有效内容</p>';
  let processedData = reportData;
  let pdfContent: any = { content: [], images: {} };
  let errorMessage = '';

  try {
    progressCallback?.(0)

    if (processedData.createTime) {
      processedData.createTime = dayjs(processedData.createTime).format('YYYY-MM-DD')
    }
    if (processedData.detectionDate) {
      processedData.detectionDate = dayjs(processedData.detectionDate).format('YYYY-MM-DD')
    }
    progressCallback?.(0.2)
    progressCallback?.(0.4)

    // 获取模板
    try {
      template = customTemplate || '';
      if (!template || template.trim() === '' || !template.includes('检测')) {
        template = getDefaultTemplate();
      }
      // 用来测试模版，假设是获取到的最新模版内容
      // template = getDefaultTemplate();

      template = correctTemplate(template);

      if (!template || typeof template !== 'string' || template.trim() === '') {
        template = '<p>无有效内容</p>';
      }
    } catch (templateError) {
      errorMessage = '获取模板失败，使用默认空模板';
      template = '<p>无有效内容</p>';
    }

    // 替换模板变量
    try {
      if (template) {
        Object.entries(processedData).forEach(([key, value]) => {
          if (typeof value === 'string' || typeof value === 'number') {
            if (['propertyName', 'basicName'].includes(key) && typeof value === 'string') {
              // 使用HTML表格强制图片和文本在同一行
              const items = String(value).split(/[,，]/).map(item => item.trim());
              let checkboxItems = '';

              if (key === 'basicName') {
                // basicName使用1列多行布局
                checkboxItems = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">`;

                // 每个项目一行
                items.forEach(item => {
                  checkboxItems += `<tr>
                    <td style="border: none; text-align: left; width: 100%;">
                      <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: none; padding: 0; width: 100%;">
                        <tr style="border: none; text-align: left; width: 100%;">
                          <td style="padding: 0; border: none; vertical-align: top; width: 14px; "><img src="${checkboxData}" width="14" height="14" /></td>
                          <td style="border: none; word-wrap: break-word; word-break: break-all; margin-left: -26px;">${item}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>`;
                });
                checkboxItems += '</table>';
              }
              if (key === 'propertyName') {
                // propertyName超过2个项目时使用2列多行布局
                checkboxItems = `<table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; width: 100%;">`;
                const rowCount = Math.ceil(items.length / 2);

                for (let i = 0; i < rowCount; i++) {
                  checkboxItems += '<tr>';
                  for (let j = 0; j < 2; j++) {
                    const index = i * 2 + j;
                    if (index < items.length) {
                      checkboxItems += `<td style="border: none; text-align: left; padding: 2px; width: 50%;">
                        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; border: none; padding: 0; width: 100%;">
                          <tr>
                            <td style="padding: 0; border: none; vertical-align: top; width: 14px;"><img src="${checkboxData}" width="14" height="14" /></td>
                            <td style="border: none; word-wrap: break-word; word-break: break-all;">${items[index]}</td>
                          </tr>
                        </table>
                      </td>`;
                    } else {
                      // 填充空单元格以保持表格结构
                      checkboxItems += '<td style="border: none;"></td>';
                    }
                  }
                  checkboxItems += '</tr>';
                }
                checkboxItems += '</table>';
              }
              template = template?.replace(new RegExp(`{{${key}}}`, 'g'), checkboxItems);
            } else {
              template = template?.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
            }
          }
        });
      }
    } catch (replaceError) {
      errorMessage = errorMessage || '替换模板变量失败，部分内容可能显示不正确';
    }

    // 生成结果表格并添加到模板
    try {
      template += `
        <div style="page-break-before: always; margin-top: 20px;">
          <h3 style="font-size: 16px; margin-bottom: 10px; text-align: center; visibility: hidden; opacity: 0;">检测结果</h3>
        </div>
      `;

      const resultTableHtml = generateResultTableHtml(resultRows);
      template += `
        <div style="page-break-inside: avoid;">
          ${resultTableHtml}
        </div>
      `;
    } catch (tableError) {
      errorMessage = errorMessage || '生成结果表格失败，报告中可能不包含检测结果';
      template += `
        <div>
          <h3 style="font-size: 16px; margin-bottom: 10px; text-align: center; visibility: hidden; opacity: 0;">检测结果</h3>
          <p style="color: red;">生成结果表格失败，请重试</p>
        </div>
      `;
    }

    // 处理HTML中的图片
    try {
      template = await processHtmlImages(template);
    } catch (imageError) {
      errorMessage = errorMessage || '处理图片失败，报告中的图片可能无法正确显示';
    }

    progressCallback?.(0.5)

    // 转换HTML为PDF内容
    try {
      pdfContent = htmlToPdfmake(template, {
        imagesByReference: true,
        tableAutoSize: true,
        removeExtraBlanks: true,
        defaultStyles: {
          window: window,
          h2: { fontSize: 36, bold: true, color: '#000', fontWeight: '700', font: 'FangSong' },
          h3: { fontSize: 24, bold: true, color: '#000', fontWeight: '700', font: 'FangSong' },
          td: {
            color: '#333333',
            borderColor: '#d9d9d9',
            borderWidth: 1,
            alignment: 'left',
            wordWrap: true,
            lineHeight: 1.5,
            font: 'FangSong'
          },
          sup: { fontSize: 8, offset: 2, font: 'FangSong' }
        },
        customImageHandler: (element: HTMLImageElement) => {
          const maxWidth = 455;
          const img = element as HTMLImageElement;
          if (img.width > maxWidth) {
            const ratio = img.height / img.width;
            img.width = maxWidth;
            img.height = maxWidth * ratio;
          }
          return null;
        }
      });
    } catch (pdfmakeError) {
      errorMessage = errorMessage || '转换报告格式失败，报告可能无法正确显示';
      // 创建一个简单的内容作为备用
      pdfContent = {
        content: [
          { text: '检测报告', style: 'header' },
          { text: '报告生成过程中出现错误，部分内容可能无法正确显示', style: 'normalText', color: 'red' },
          { text: errorMessage, style: 'normalText', color: 'red' }
        ],
        images: {}
      };
    }

    progressCallback?.(0.6)

    // 如果有错误信息，添加到PDF内容中
    if (errorMessage) {
      if (Array.isArray(pdfContent.content)) {
        pdfContent.content.unshift({
          text: `注意: ${errorMessage}`,
          style: 'normalText',
          color: 'red',
          margin: [0, 0, 0, 10]
        });
      }
    }

    const simpleDocDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      info: {
        title: `检测报告_${processedData.code || ''}`,
        author: processedData.company || '',
        subject: '检测报告',
        keywords: '检测报告',
      },
      content: pdfContent.content,
      images: pdfContent.images || {},
      defaultStyle: {
        font: 'FangSong',
        fontSize: 12
      },
      footer: (currentPage: number, pageCount: number): Content => {
        return {
          text: `第 ${currentPage} 页 共 ${pageCount} 页`,
          alignment: 'right',
          margin: [0, 20, 60, 0],
          fontSize: 10,
          color: '#666666'
        };
      },
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
          color: '#333333'
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
          color: '#333333'
        },
        tableHeader: {
          bold: true,
          fontSize: 14,
          color: '#333333',
        },
        normalText: {
          fontSize: 12,
          margin: [0, 5, 0, 5],
          color: '#333333'
        },
        table: {
          margin: [0, 5, 0, 15],
        },
        tableCell: {
          margin: [20, 20, 20, 20],
        }
      }
    };

    // 添加水印
    if (watermarkImg) {
      try {
        const watermarkBase64 = await getBase64ImageFromURL(watermarkImg);
        simpleDocDefinition.background = (): Content => {
          const pageWidth = 595.28; // A4宽度
          const pageHeight = 841.89; // A4高度
          return [
            {
              image: watermarkBase64,
              width: 100,
              opacity: 0.5,
              absolutePosition: {
                x: pageWidth - 120,
                y: pageHeight - 150
              }
            }
          ];
        };
      } catch { }
    }

    const pdfDocGenerator = pdfMake.createPdf(simpleDocDefinition);

    progressCallback?.(0.8)

    const pdfBlob = await new Promise<Blob>((resolve) => {
      pdfDocGenerator.getBlob((blob: Blob | PromiseLike<Blob>) => {
        resolve(blob)
      })
    })
    const pdfUrl = URL.createObjectURL(pdfBlob)
    const filename = `检测报告_${processedData.reportNumber || processedData.code || dayjs().format('YYYYMMDDHHmmss')}.pdf`
    progressCallback?.(1.0)

    return {
      blob: pdfBlob,
      url: pdfUrl,
      filename: filename
    }
  } catch (error) {
    try {
      const errorContent = {
        content: [
          { text: '检测报告 (生成失败)', style: 'header' },
          { text: `错误信息: ${(error as { message: string; }).message || '未知错误'}`, style: 'normalText', color: 'red' },
          { text: '请尝试重新生成报告或联系技术支持', style: 'normalText' }
        ]
      };

      const errorDocDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        content: errorContent.content,
        defaultStyle: {
          font: 'FangSong',
          fontSize: 12
        },
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            margin: [0, 0, 0, 10],
            color: '#333333'
          },
          normalText: {
            fontSize: 12,
            margin: [0, 5, 0, 5],
            color: '#333333'
          }
        }
      };

      const errorPdfGenerator = pdfMake.createPdf(errorDocDefinition);
      const errorPdfBlob = await new Promise<Blob>((resolve) => {
        errorPdfGenerator.getBlob((blob: Blob | PromiseLike<Blob>) => {
          resolve(blob)
        })
      });

      const errorPdfUrl = URL.createObjectURL(errorPdfBlob);
      const errorFilename = `检测报告_错误_${dayjs().format('YYYYMMDDHHmmss')}.pdf`;

      progressCallback?.(1.0);

      return {
        blob: errorPdfBlob,
        url: errorPdfUrl,
        filename: errorFilename
      };
    } catch (fallbackError) {
      throw new Error(`生成PDF报告失败: ${(error as { message: string; }).message || '未知错误'}`);
    }
  }
}

/**
 * 处理HTML中的图片，将相对路径转换为绝对URL或base64
 * @param html HTML内容
 * @returns 处理后的HTML内容
 */
const processHtmlImages = async (html: string): Promise<string> => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const imgElements = tempDiv.querySelectorAll('img');

  try {
    const promises = Array.from(imgElements).map(async (img) => {
      const src = img.getAttribute('src');
      if (!src) return;

      if (src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://')) {
        return;
      }

      try {
        const absoluteUrl = new URL(src, window.location.origin).href;
        try {
          const base64Data = await getBase64ImageFromURL(absoluteUrl);
          img.setAttribute('src', base64Data);
        } catch (error) {
          // 图片加载失败时，使用默认的占位图片
          img.setAttribute('src', defaultImageData);
          img.setAttribute('alt', '图片加载失败');
          img.style.border = '1px dashed #ccc';
          img.style.padding = '5px';
        }
      } catch (urlError) {
        img.setAttribute('src', defaultImageData);
        img.setAttribute('alt', '图片路径无效');
        img.style.border = '1px dashed #ccc';
        img.style.padding = '5px';
      }
    });

    await Promise.all(promises);
    return tempDiv.innerHTML;
  } catch (error) {
    return html;
  }
};
/**
 * 将图片URL转换为base64
 * @param url 图片URL
 * @returns base64编码的图片数据
 */

const getBase64ImageFromURL = async (path: string): Promise<string> => {
  let url = path;
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' });
    if (!response.ok) {
      url = defaultImageData
    }
  } catch {
    url = defaultImageData
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.onload = (): void => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('无法创建canvas上下文'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL);
    };
    img.onerror = (error): void => {
      reject(error);
    };

    img.src = url;
  });
};
/**
 * 生成结果表格HTML
 * @param resultRows 结果行数据
 * @returns 结果表格HTML
 */
/**
 * 处理文本中的特殊上标字符
 * @param text
 * @returns
 */
const processSpecialSuperscripts = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/([a-zA-Z])([²])/g, '$1<sup>2</sup>') // 处理 m² 等
    .replace(/([a-zA-Z])([³])/g, '$1<sup>3</sup>')
    .replace(/(\d)([²])/g, '$1<sup>2</sup>') // 处理 10² 等
    .replace(/(\d)([³])/g, '$1<sup>3</sup>')
    .replace(/㎡/g, 'm<sup>2</sup>')
    .replace(/㎥/g, 'm<sup>3</sup>')
    .replace(/㎠/g, 'cm<sup>2</sup>')
    .replace(/㎤/g, 'cm<sup>3</sup>')
    .replace(/㎦/g, 'mm<sup>2</sup>')
    .replace(/㎣/g, 'mm<sup>3</sup>');
};

export const generateResultTableHtml = (resultRows: ReportStampInfoDTO[]): string => {
  if (!resultRows || resultRows.length === 0) {
    return `
      <tr>
        <td colspan="5" style="text-align: center;">暂无检测结果数据</td>
      </tr>
    `
  }
  const tableStyle = `style="border-collapse: collapse; width: 100%; color: #333;"`;
  const thStyle = `style="border: 1px solid #d9d9d9; background-color: #f2f2f2; line-height: 2; font-weight: bold; text-align: center;  vertical-align: middle;"`;
  const tdStyle = `style="border: 1px solid #d9d9d9; padding: 20px 8px; line-height: 2; text-align: center; vertical-align: middle;"`;

  const tableHeader = `
    <tr>
      <th ${thStyle}><br>采样信息</th>
      <th ${thStyle}><br>检测项目</th>
      <th ${thStyle}><br>检测结果</th>
      <th ${thStyle}><br>技术要求</th>
      <th ${thStyle}><br>单项结论</th>
    </tr>
  `;
  const tableRows = resultRows.map(row => {
    if (!row.propCheckList || row.propCheckList.length === 0) {
      return `
        <tr>
          <td ${tdStyle}><br>${row.deviceName || ''}</td>
          <td ${tdStyle}></td>
          <td ${tdStyle}></td>
          <td ${tdStyle}></td>
          <td ${tdStyle}><br>${row.qualifiedBool ? '合格' : '不合格'}<br></td>
        </tr>
      `;
    }
    return row.propCheckList.map((prop, index) => {
      const deviceNameCell = index === 0 ? `<td rowspan="${row.propCheckList?.length || 1}" ${tdStyle}><br>${row.deviceName || ''}</td>` : '';
      const processedPropName = processSpecialSuperscripts(prop.propName || '');
      return `
        <tr>
          ${deviceNameCell}
          <td ${tdStyle}><br>${processedPropName}</td>
          <td ${tdStyle}><br>${prop.value !== undefined ? prop.value : ''}</td>
          <td ${tdStyle}><br>${prop.maxMin || ''}</td>
          <td ${tdStyle}><br>${prop.result || ''}</td>
        </tr>
      `;
    }).join('');
  }).join('');
  return `<table ${tableStyle}>${tableHeader}${tableRows}</table>`;
}
