export interface FileState {
  businessKey?: string | null;
  id: string | null;
  name?: null | string;
  path?: null | string;
  refCount?: number | null;
  size?: number | null;
  suffix?: null | string;
  type?: null | string;
}
/**
 * kkfile预览文件
 * @param file 文件服务相应的对象
 * @returns
 */
export const kkFilePreview = (file: FileState): void => {
  const index = file.name?.lastIndexOf('.') // （考虑严谨用lastIndexOf(".")得到）得到"."在第几位
  const fileValueSuffix = file.name?.substring(index ?? 0) ?? '' // 截断"."之前的，得到后缀
  let fileType = ''
  if (/(.*)\.(mp4|avi|wmv|MP4|AVI|WMV|flv)$/.test(fileValueSuffix)) {
    fileType = 'video'
  } else if (/(.*)\.(jpg|JPG|bmp|BMP|mpg|MPG|mpeg|MPEG|tis|TIS|png|gif|jpge|svg|webp|jpeg)$/.test(fileValueSuffix)) { // 根据后缀，判断是否符合图片格式
    fileType = 'image'
  } else if (/(.*)\.(xls|XLS|xlsx|XLSX)$/.test(fileValueSuffix)) {
    fileType = 'excel'
  } else if (/(.*)\.(doc|DOC)$/.test(fileValueSuffix)) {
    fileType = 'doc'
  } else if (/(.*)\.(docx|DOCX)$/.test(fileValueSuffix)) {
    fileType = 'docx'
  } else if (/(.*)\.(PPT|PPTX|ppt|pptx)$/.test(fileValueSuffix)) {
    fileType = 'ppt'
  } else if (/(.*)\.(pdf|PDF)$/.test(fileValueSuffix)) {
    fileType = 'pdf'
  } else if (/(.*)\.(txt|TXT)$/.test(fileValueSuffix)) {
    fileType = 'txt'
  } else if (/(.*)\.(mp3|wav|m4a)$/.test(fileValueSuffix)) {
    fileType = 'audio'
  } else {
    fileType = 'unknown'
  }

  if (!['doc', 'docx', 'excel', 'pdf', 'ppt', 'txt', 'video','audio'].includes(fileType)) {
    return
  }

  if (!file.path?.includes('http')) {
    file.path = window.location.origin + file.path
  }
  let previewUrl = `${window.location.origin}/tools/kkfileview/onlinePreview?url=${encodeURIComponent(btoa(file.path))}&fileName=${file.name}`
  // excel预览需要使用html方式预览（省略-中转页面点击）
  fileType === 'excel' && (previewUrl += `&officePreviewType=html`)

  // 判断是否为移动端
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  if (isMobile) {
    // 移动端使用内嵌iframe方式预览，并提供关闭按钮
    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.width = '100%'
    overlay.style.height = '100%'
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
    overlay.style.zIndex = '9999'
    overlay.style.display = 'flex'
    overlay.style.flexDirection = 'column'
    // 创建关闭按钮
    const closeBtn = document.createElement('div')
    closeBtn.style.position = 'absolute'
    closeBtn.style.top = '10px'
    closeBtn.style.right = '10px'
    closeBtn.style.width = '30px'
    closeBtn.style.height = '30px'
    closeBtn.style.borderRadius = '50%'
    closeBtn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'
    closeBtn.style.display = 'flex'
    closeBtn.style.justifyContent = 'center'
    closeBtn.style.alignItems = 'center'
    closeBtn.style.zIndex = '10000'
    closeBtn.style.cursor = 'pointer'
    closeBtn.innerHTML = '✕'
    closeBtn.style.fontSize = '18px'
    closeBtn.style.color = '#333'
    // 创建iframe
    const iframe = document.createElement('iframe')
    iframe.src = previewUrl
    iframe.style.width = '100%'
    iframe.style.height = '100%'
    iframe.style.border = 'none'
    // 添加关闭事件
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(overlay)
    })
    // 组装DOM
    overlay.appendChild(closeBtn)
    overlay.appendChild(iframe)
    document.body.appendChild(overlay)
  } else {
    // PC端继续使用window.open
    window.open(previewUrl)
  }
}
