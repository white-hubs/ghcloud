import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
export const downloadPDF = (page: HTMLElement, title: string): void => {
  html2canvas(page).then(function (canvas) {
    canvas2PDF(canvas, title)
  })
}

const canvas2PDF = (canvas: HTMLCanvasElement, title: string): void => {
  const contentWidth = canvas.width
  const contentHeight = canvas.height
  let leftHeight = contentHeight
  let position = 0
  const pageHeight = contentWidth / 592.28 * 841.89
  const pageData = canvas.toDataURL('image/jpeg', 1.0)
  // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
  const imgWidth = 595.28
  const imgHeight = 592.28 / contentWidth * contentHeight
  const pdf = new jsPDF('p', 'pt')

  if (leftHeight < pageHeight) {
    pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight)
  } else {
    while (leftHeight > 0) {
      pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight)
      leftHeight -= pageHeight
      position -= 841.89
      // 避免添加空白页
      if (leftHeight > 0) {
        pdf.addPage()
      }
    }
  }
  pdf.save(title + '.pdf')
}
