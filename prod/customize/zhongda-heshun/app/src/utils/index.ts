export const getBase64 = (url: string, name: string): void => {
  const img = new Image()
  img.setAttribute('crossOrigin', 'anonymous')
  img.src = url
  img.onload = (): void => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(img, 0, 0, img.width, img.height)
    const quality = 0.8
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    const a = document.createElement('a')
    a.download = name || '下载'
    a.style.display = 'none'
    a.href = dataUrl
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}

export const debounce = (fn: () => unknown, delay: number): unknown => {
  let debounceTimer: NodeJS.Timeout | null
  return (...args: any) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    debounceTimer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export const typeList = ['doc', 'docx', 'excel', 'xlsx', 'xls', 'pdf', 'ppt', 'txt', 'zip', 'rar']
export const imgType = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'jpge', 'webp', 'mpeg', 'raw', 'heic']
