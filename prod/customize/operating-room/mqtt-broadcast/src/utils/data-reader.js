import axios from 'axios'

const fileUrl = 'http://127.0.0.1/data.js'
// const fileUrl = 'http://192.168.3.85:80/data.js'

export async function getRemoteDataJS () {
  return new Promise((resolve, reject) => {
    axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'text'
    })
      .then(response => {
        const jsFileContent = response.data
        const regex = /window\.businessData\s*=\s*([^;]+)/
        const match = jsFileContent.match(regex)
        if (match) {
          const businessDataValue = match[1].trim()
          const res = eval(`(${businessDataValue})`)
          resolve(res)
        } else {
          reject(new Error('解析data.js文件失败'))
        }
      })
      .catch(() => {
        reject(new Error('获取data.js文件失败'))
      })
  })
}
