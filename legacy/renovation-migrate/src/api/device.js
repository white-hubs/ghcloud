import request from '@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request'

const baseURL = '/api/device'
export const processInputForm = (params, method = 'get') =>
  request({
    url: `/api/process/form/task/${params.id ? params.id : params
      }`,
    method: method,
    params,
  })
  export const processComplete = (data, method = 'get') =>
  request({
    url: `/api/process/user-tasks/complete`,
    method: method,
    data,
  })
  export const process = (params, method) =>
  request({
    url: `/api/process/process-definition/list`,
    method: method,
    params,
  })
// 分类下的设备实例
export const generDevice = (params, method = 'get') =>
  request({
    url: baseURL + '/device/instance/list-by-genre',
    method: method,
    params
  })

// 设备实例列表 - 查询
export const getInstanceList = (params, method = 'get') =>
  request({
    url: baseURL + '/device/instance/list-page',
    method: method,
    params
  })

// 设备实例 - 新增
export const instanceOperate = (data, method) =>
  request({
    url: baseURL + '/device/instance',
    method: method,
    data
  })


//设备实例详情 - 查询
export const getInstanceById = (params, method = 'get') =>
  request({
    url: baseURL + '/device/instance/' + (params.id ? params.is : params),
    method: method,
  })

// 设备实例 - 删除
export const delInstance = (params, method = 'delete') =>
  request({
    url: baseURL + '/device/instance/delete/batch/' + params,
    method: method,
  })

// 设备品牌 - 查询
export const getBrandSearch = (params, method = 'get') =>
  request({
    url: baseURL + '/device/brand/search',
    method: method,
    params
  })
// 设备品牌 - 新增
export const postBrand = (data, method = 'post') =>
  request({
    url: baseURL + '/device/brand',
    method: method,
    data
  })
// 设备品牌 - 修改
export const putBrand = (data, method = 'put') =>
  request({
    url: baseURL + '/device/brand',
    method: method,
    data
  })
// 设备品牌 - 删除
export const delBrand = (params, method = 'delete') =>
  request({
    url: baseURL + '/device/brand/' + params,
    method: method,
  })

// 设备型号 - 查询
export const getModelList = (params, method = 'get') =>
  request({
    url: baseURL + '/device/model/list-page',
    method: method,
    params
  })

// 设备型号 - 详情
export const getModelById = (params, method = 'get') =>
  request({
    url: baseURL + '/device/model/' + (params.id ? params.id : params),
    method: method,
  })

// 设备型号 - 新增,修改
export const euiqModelOperate = (data, method = 'post') =>
  request({
    url: baseURL + '/device/model',
    method: method,
    data
  })

// 设备型号 - 删除
export const delModel = (params, method = 'delete') =>
  request({
    url: baseURL + '/device/model/' + (params.id ? params.id : params),
    method: method,
  })

// 设备型号 - 事件
export const eveModel = (params, method = 'get') =>
  request({
    url: baseURL + '/device/mode/event/list/' + (params.id ? params.id : params),
    method: method,
  })

// 设备型号 - 属性
export const attrModel = (params, method = 'get') =>
  request({
    url: baseURL + '/device/model/' + (params.id ? params.id : params) + '/associated-attribute',
    method: method,
  })

// 设备型号 - 关联属性
export const attrModelConnect = (data, method = 'get') =>
  request({
    url: baseURL + '/device/model/attribute/assciate',
    method: method,
    data
  })

// 设备型号 - 解除关联属性
export const attrModelDel = (data, method = 'post') =>
  request({
    url: baseURL + '/device/model/attributeId/relieve',
    method: method,
    data
  })


// 设备型号 - 添加事件
export const eveModelAdd = (data, method = 'get') =>
  request({
    url: baseURL + '/device/model/event',
    method: method,
    data
  })


// 设备型号 - 删除事件
export const eveModelDel = (data, method = 'delete') =>
  request({
    url: baseURL + `/device/model/event/${data.id ? data.id : data}`,
    method: method,
    data
  })

// 设备类型 - 查询
export const getGenreSearch = (params, method = 'get') =>
  request({
    url: baseURL + '/device/genre/search',
    method: method,
    params
  })

// 设备类型 - 详情
export const getGenreById = (params, method = 'get') =>
  request({
    url: baseURL + '/device/genre/' + params,
    method: method,
  })
// 设备类型 - 新增
export const postGenre = (data, method = 'post') =>
  request({
    url: baseURL + '/device/genre',
    method: method,
    data
  })
// 设备类型 - 修改
export const putGenre = (data, method = 'put') =>
  request({
    url: baseURL + '/device/genre',
    method: method,
    data
  })
// 设备类型 - 删除
export const delGenre = (params, method = 'delete') =>
  request({
    url: baseURL + '/device/genre/' + params,
    method: method,
  })

// 设备属性 - 查询
export const getAttributeSearch = (params, method = 'get') =>
  request({
    url: baseURL + '/device/attribute/search',
    method: method,
    params
  })

// 设备属性 - 树
export const getAttributeTree = (params, method = 'get') =>
  request({
    url: baseURL + '/device/attribute/level-list',
    method: method,
    params
  })

//设备属性 - 查询详情
export const getAttributeById = (params, method = 'get') =>
  request({
    url: baseURL + '/device/attribute/' + params,
    method: method,
  })
// 设备属性 - 新增
export const attributeOperate = (data, method = 'post') =>
  request({
    url: baseURL + '/device/attribute',
    method: method,
    data
  })
// 设备属性 - 修改
export const putAttribute = (data, method = 'put') =>
  request({
    url: baseURL + '/device/attribute',
    method: method,
    data
  })
// 设备属性 - 删除
export const delAttribute = (params, method = 'delete') =>
  request({
    url: baseURL + '/device/attribute/' + params,
    method: method,
  })

// 属性类型 - 查询
export const getAttributeTypeSearch = (params, method = 'get') =>
  request({
    url: baseURL + '/device/attribute/type/search',
    method: method,
    params
  })
// 属性类型 - 新增
export const postAttributeType = (data, method = 'post') =>
  request({
    url: baseURL + '/device/attribute/type',
    method: method,
    data
  })
// 属性类型 - 修改
export const putAttributeType = (data, method = 'put') =>
  request({
    url: baseURL + '/device/attribute/type/',
    method: method,
    data
  })
// 属性类型 - 删除
export const delAttributeType = (params, method = 'delete') =>
  request({
    url: baseURL + '/device/attribute/type/' + params,
    method: method,
  })

// 系统专业 - 查询
export const getSystemProfessionSearch = (params, method = 'get') =>
  request({
    url: baseURL + '/device/system-profession/search',
    method: method,
    params
  })

// 获取内置数据类型
export const getDictDataType = (params, method = 'get') =>
  request({
    url: baseURL + '/device/dict/data-type',
    method: method,
    params
  })
// 获取内置数据单位
export const getAttributeUnit = (params, method = 'get') =>
  request({
    url: baseURL + '/device/attribute/unit',
    method: method,
    params
  })
// 获取属性状态项
export const getAttributeStatus = (params, method = 'get') =>
  request({
    url: baseURL + '/device/attribute/status',
    method: method,
    params
  })
// 获取比较操作项
export const getAttributeCompareOption = (params, method = 'get') =>
  request({
    url: baseURL + '/device/attribute/compare-option',
    method: method,
    params
  })
// 物联配置
export const putInstanceDeployIot = (data, method = 'put') =>
  request({
    url: baseURL + '/device/instance/deploy-iot-template',
    method: method,
    data
  })
// 获取物联协议
export const getIotSchema = (params, method = 'get') =>
  request({
    url: baseURL + '/device/iot-schema',
    method: method,
    params
  })
// 设备运行信息
export const deviceRunInfo = (params, method = 'get') =>
  request({
    url: baseURL + `/device/instance/${params?.deviceInstanceId ? params.deviceInstanceId : params}/running/status`,
    method: method,
    params
  })
