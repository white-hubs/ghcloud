import { message } from '@ghcloud/cube-ui'
import axios from 'axios'
import { authStore } from '@/api/auth-store'

export async function exportExcel (url: string, params: unknown, fileName: string) {
  return new Promise((resolve, reject) => {
    axios({
      url: '/api' + url,
      responseType: 'blob',
      method: 'get',
      params,
      headers: {
        tenant: authStore.tenant,
        authorization: authStore.token ? (authStore.token.includes('Bearer') ? authStore.token : 'Bearer ' + authStore.token) : '',
        terminal: authStore.terminal,
        'Content-Type': 'application/json'
      }
    }).then((res: { data: BlobPart; }) => {
      const link = document.createElement('a')
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' }) // 文件流处理
      link.style.display = 'none'
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      // 模拟点击事件
      link.click()
      // 移除创建的a标签
      window.URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
      resolve(true)
    }).catch((error: { response: { data: {
      error_description: string;
      message: string; code: string; data: unknown;
    }; }; }) => {
      if (error.response) {
        const data = error.response.data
        const errCode = data.code
        if (errCode) {
          if (data.data instanceof Object) {
            const obj = data.data
            for (const i in obj) {
              message.error(obj[i])
            }
          } else if (data.message) {
            message.error(data.message)
          }
        } else {
          message.error(data.error_description || data.message || '请求出现错误')
        }
      }
      reject(error)
    })
  })
}
