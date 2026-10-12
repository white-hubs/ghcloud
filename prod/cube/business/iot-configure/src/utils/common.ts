import type { ImportType } from '@/api/model/geteway'
import { getTenant, getToken, setTenant, setToken } from '@/tools'
import axios from 'axios'

const nowEnterpriseKey = 'GH-NowEnterprise'

// TODO(zhangzheng): move to model
interface Enterprise {
  code: string;
}

export function getNowEnterprise (): Enterprise {
  return JSON.parse(sessionStorage.getItem(nowEnterpriseKey) ?? '') as Enterprise
}

// 导出excel
export async function exportExcel (url: string, data: unknown, fileName: string): Promise<unknown> {
  return new Promise((resolve) => {
    axios({
      url: '/api' + url,
      responseType: 'blob',
      method: 'get',
      params: data,
      headers: {
        tenant: `${getTenant()}`,
        token: `${getToken()}`,
        terminal: 10000,
        'Content-Type': 'application/json'
      }
    }).then(res => {
      resolve(res)
      // 创建一个隐藏的a链接
      const link = document.createElement('a')
      const blob = new Blob([res.data], { type: 'application/vnd.ms-excel' }) // 文件流处理
      link.style.display = 'none' // 去除a标签的样式
      link.href = URL.createObjectURL(blob)
      link.download = fileName
      document.body.appendChild(link)
      // 模拟点击事件
      link.click()
      // 移除创建的a标签
      window.URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
    }).catch(err => {
      if (err.response.status === 401) {
        setTenant('')
        setToken('')
        window.location.reload()
      }
      resolve(null)
    })
  })
}
// 导入
export async function importExcel (url: string, data: unknown): Promise<ImportType> {
  const headers = { 'Content-Type': 'multipart/form-data', tenant: `${getTenant()}`, token: `${getToken()}` }

  return axios.post(url, data, { headers }).then((res) => {

    return res.data.data
  }).catch(err => {
    if (err.response.status === 401) {
      setTenant('')
      setToken('')
      window.location.reload()
    }
  })
}
