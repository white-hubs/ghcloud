let pageWidth = 1920

/** 设置页面基准尺寸 */
export function calcRootFontSize (): void {
  const html = document.getElementsByTagName('html')[0] /* 获取标签元素<html> */
  const oWidth = document.body.clientWidth /* 获取设备的宽度 */
  html.style.fontSize = oWidth / (pageWidth / 10) + 'px' /* 设置根元素<html>字体大小  */
}

export function setPageWidth (width: number): void {
  pageWidth = width
  calcRootFontSize()
  window.removeEventListener('resize', calcRootFontSize, false)
  window.addEventListener('resize', calcRootFontSize, false)
}
