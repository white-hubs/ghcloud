import axios from 'axios'

const nowEnterpriseKey = 'GH-NowEnterprise'

// TODO(zhangzheng): move to model
interface Enterprise {
  code: string;
}

interface Authorization {
  accessToken: string;
}

export function getNowEnterprise (): Enterprise {
  return JSON.parse(sessionStorage.getItem(nowEnterpriseKey) ?? '') as Enterprise
}
// ---- 设置token ----
const tokenKey = 'GH-Token'

export function getToken (): Authorization {
  const res = JSON.parse(sessionStorage.getItem(tokenKey) ?? '') as { access_token: string; }
  const authorization: Authorization = {
    accessToken: res.access_token
  }
  return authorization
}

// 导出excel
export function exportExcel (url: string, data: unknown, fileName: string): void {
  axios({
    url: '/api/maintain/' + url,
    responseType: 'blob',
    method: 'get',
    params: data,
    headers: {
      tenant: getNowEnterprise()?.code,
      terminal: 10000,
      Authorization: `Bearer ${getToken().accessToken}`,
      'Content-Type': 'application/json'
    }
  }).then(res => {
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
  })
}
