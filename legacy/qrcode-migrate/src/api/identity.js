import request from '@/utils/request'
let baseURL = '/api/identity'
// 实体类型列表
export const getEntityType = (params) =>
  request({
    url: baseURL + '/entity/type/list',
    method: 'get',
    params
  })
//实体类型对应的应用列表
export const getApplicationList= (params) =>
request({
  url: baseURL + '/entity/application/list',
  method: 'get',
  params
})
//更新实体类型对应的应用列表
export const updateApplicationList= (params) =>
request({
  url: baseURL + '/entity/application/save',
  method: 'post',
  params
})
//更新实体类型对应的应用列表(批量)
export const updateApplicationListBatch= (params) =>
request({
  url: baseURL + '/entity/application/batchSave',
  method: 'post',
  params
})
// 实体属性列表
// export const getEntityAttribute = (params) =>
//   request({
//     url: baseURL + '/qrcode/style/entity/attribute',
//     method: 'get',
//     params
//   })
// 二维码样式新增
export const addQrcodeStyle = (data) =>
  request({
    url: baseURL + '/qrcode/style',
    method: 'post',
    data
  })
// 二维码样式分页
export const qrcodeStylePage = (params) =>
  request({
      url: baseURL + '/qrcode/style/page',
      method: 'get',
      params
  })
// 二维码样式列表
export const qrcodeStyleList = (params) =>
  request({
      url: baseURL + '/qrcode/style/list',
      method: 'get',
      params
  })
//实体类型绑定的二维码样式列表
export const bindStyleList = (params) =>
  request({
      url: baseURL + '/entity/style/page',
      method: 'get',
      params
  })
  //绑定实体类型二维码样式
export const bindqrcodeStyle = (params) =>
  request({
    url: baseURL + `/entity/${params.entityType}/bind/${params.styleId}`,
    method: 'put',
    params
  })
//解绑实体类型二维码样式
export const unBindqrcodeStyle = (params) =>
  request({
      url: baseURL + `/entity/${entityType}/unbind/${styleId}`,
      method: 'delete',
      params
  })
// 二维码样式修改
export const editQrcodeStyle = (data) =>
  request({
      url: baseURL + `/qrcode/style/${data.id}`,
      method: 'put',
      data
  })
// 二维码样式删除
export const deleteQrcodeStyle = (params) =>
  request({
      url: baseURL + `/qrcode/style/${params?.id || params}`,
      method: 'delete',
      params
  })
// 批量删除二维码样式
export const batchDeleteQrcodeStyle = (params) =>
  request({
      url: baseURL + `/qrcode/style/batch`,
      method: 'delete',
      params
  })
// 通过id查询二维码样式详情
export const getQrcodeStyleDetailById = (params) =>
  request({
      url: baseURL + `/qrcode/style/${params.id}`,
      method: 'get',
      params
  })
// 二维码分页列表
export const getQrcodePage = (params) =>
  request({
    url: baseURL + `/qrcode/page`,
    method: 'get',
    params
  })
// 生成code
export const createCode = (params) =>
  request({
    url: baseURL + `/qrcode/generate/code`,
    method: 'get',
    params
  })
// 通过id查询二维码详情
export const getQrcodeDetail = (params) =>
  request({
    url: baseURL + `/qrcode/${params.id}`,
    method: 'get',
    params
  })
// 二维码预览
export const previewQrcode = (params) =>
  request({
    url: baseURL + `/qrcode/preview`,
    method: 'post',
    params
  })
// 批量下载二维码压缩包
export const downloadQrcodeBatch = (data) =>
  request({
    url: baseURL + `/qrcode/generate/batch/download`,
    method: 'post',
    data,
    responseType: 'blob'
  })
// 新增二维码
export const addQrcode = (data) =>
  request({
    url: baseURL + `/qrcode`,
    method: 'post',
    data
  })
// 二维码修改
export const editQrcode = (data) =>
  request({
    url: baseURL + `/qrcode/${data.id}`,
    method: 'put',
    data
  })
// 二维码删除
export const deleteQrcode = (params) =>
  request({
    url: baseURL + `/qrcode/${params?.id || params}`,
    method: 'delete',
    params
  })
// 批量删除二维码
export const batchDeleteQrcode = (params) =>
  request({
    url: baseURL + `/qrcode/batch`,
    method: 'delete',
    params
  })
// 查询当前租户的二维码应用
export const getQrcodeApplication = () =>
request({
    url: baseURL + `/qrcode/application`,
    method: 'get',
})
// 通过ID删除二维码应用
export const deleteQrcodeApplication = (params) =>
request({
  url: baseURL + `/qrcode/application/${params?.id || params}`,
  method: 'delete',
  params
})
// 添加二维码应用
export const addQrcodeApplication = (data) =>
  request({
    url: baseURL + `/qrcode/application`,
    method: 'post',
    data
  })
