import { existsSync, mkdirSync, createWriteStream, unlinkSync } from 'fs';
import axios from 'axios';
import decompress from 'decompress';
import pkg from 'fs-extra';

const { emptyDirSync, copySync, removeSync } = pkg;
const BASE_URL = 'http://182.150.63.62:8082'
/** 通过包名获取制品列表 */
async function getProductListByPackageName(baseUrl = 'http://182.150.63.62:8082/service/extdirect', packageName = '@ghcloud/cube-operating-room-data-viz') {
  const { data } = await axios({
    method: 'post',
    url: baseUrl, // 你的 API 地址  
    headers: {
      'Content-Type': 'application/json', // 设置请求头，表示发送的数据是 JSON 格式  
    },
    data: {
      "action": "coreui_Browse",
      "method": "read",
      "data": [
        {
          "repositoryName": "npm-hosted",
          "node": packageName
        }
      ],
      "type": "rpc",
      "tid": 30
    }
  })
  const list = (data.result.data ? data.result.data : []).map(e => {
    const downloadUrl = `${BASE_URL}/repository/npm-hosted/${packageName}/-/${e.text}`
    return {
      text: e.text,
      version: e.packageUrl.split("@").at(-1),
      downloadUrl
    }
  })
  return list
}


async function downloadProduct(version) {
  const productsList = await getProductListByPackageName()
  const product = (productsList ? productsList : []).find(e => e.version === version)
  if (product) {
    // 假设这是你要下载的压缩包的URL  
    const downloadUrl = product.downloadUrl;
    // 这是你希望保存下载文件的本地路径  
    const downloadDir = `${global.workspace}`;
    const downloadPath = `${downloadDir}/${product.text}`;

    if (!existsSync(downloadDir)) {
      // 目录不存在，创建它  
      mkdirSync(downloadDir, { recursive: true });
    }
    emptyDirSync(downloadDir)

    // 下载文件  
    await axios({ method: 'get', url: downloadUrl, responseType: 'stream' }).then(response => {
      return new Promise((resolve, reject) => {
        const writer = createWriteStream(downloadPath);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
          error = err;
          writer.close();
          reject(err);
          process.exit(1)
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
        });
      });
    })

    // 解压文件  
    await decompress(downloadPath, downloadDir).catch(err => {
      process.exit(1)
    });
    copySync(`${downloadDir}/package/dist/`, downloadDir, { overwrite: true })
    removeSync(`${downloadDir}/package`)
    // 删除下载的压缩包
    unlinkSync(downloadPath);
  } else {
    process.exit(1)
  }
}


export default {
  getProductListByPackageName,
  downloadProduct
}