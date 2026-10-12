import { message } from '@ghcloud/cube-ui'

export const fileDownLoad = async (fileName: string, downLoadLink: string): Promise<void> => {
  message.loading('下载中')
  await fetch(downLoadLink).then(async (res) =>
    res.blob().then((blob) => {
      const a = document.createElement('a')
      const url = window.URL.createObjectURL(blob)
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    }))
  message.destroy()
  message.success('下载成功')
}
