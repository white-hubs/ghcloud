import JSZip from 'jszip'
import FileSaver from 'file-saver'// 引入依赖包

const zipBatch: any = {}// 方法名，调用时候用
let fileIndex = 0 // 轮循脚标，轮循一次，fileIndex++
let fileList: any = [] // 存放转化完成的文件的数组
let arrSource: any = [] // 原始数据
let blogTitle = '' // 压缩包的名称
zipBatch.zip = (arr: { path: string;title: string; }[], title: string) => {
  // 参数arr是原始数据，每个元素两个属性 path 文件链接 ，title 文件名称
  // 参数title是压缩完成的压缩包名
  fileList = []
  arrSource = arr
  blogTitle = title
  fileIndex = 0
  zipBatch.addLoop()
}
zipBatch.addLoop = () => {
  const submitIndex = fileIndex
  if (submitIndex >= arrSource.length) { // 轮询结束开始压缩
    const zip = new JSZip()
    fileList.forEach((item: { title: string; binary: string | ArrayBuffer | Blob | number[] | Uint8Array | NodeJS.ReadableStream | Promise<string | ArrayBuffer | Blob | number[] | Uint8Array | NodeJS.ReadableStream>; }) => {
      const fileName = item.title + '.xlsx' // 若下载其他文件此处后缀名就改成其他后缀名
      zip.file(fileName, item.binary, { binary: true }) // 逐个添加文件
    })
    zip.generateAsync({ type: 'blob' }).then((content) => {
      // 生成二进制流
      FileSaver.saveAs(content, blogTitle) // 利用file-saver保存文件  blogTitle:自定义文件名
    })
    return
  }
  const item = arrSource[submitIndex]

  zipBatch.addCore(item, function () {
    fileIndex++
    zipBatch.addLoop()
  })
}
zipBatch.addCore = (item: { path: string | URL; title: any; }, finallyFun: () => void) => {
  // 文件以流的形式获取
  // 方法1
  const xmlhttp = new XMLHttpRequest()
  xmlhttp.open('GET', item.path, true)
  xmlhttp.responseType = 'blob'
  // xmlhttp.setRequestHeader("Content-type", "application/json")
  xmlhttp.onload = function () {
    if (xmlhttp.status === 200) {
      fileList.push({
        binary: xmlhttp.response, // 文件
        title: item.title // 文件名称
      })
      finallyFun()
    } else {
      // 获取失败处理
    }
  }
  xmlhttp.send()
}
export default zipBatch
