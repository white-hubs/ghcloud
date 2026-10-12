import request from '@/utils/request';
let baseURL = '/api/management'

// 建筑资料
export const buildingData = (params, method) =>
  request({
    url: baseURL + `/building-data/page`,
    method: method,
    params,
  });

// 建筑资料新增
export const buildingDataAdd = (data, method) =>
  request({
    url: baseURL + `/building-data`,
    method: method,
    data,
  });

// 建筑资料删除
export const buildingDataId = (data, method) =>
  request({
    url: baseURL + `/building-data/${data?.id ? data?.id : data}`,
    method: method,
    data,
  });

// 设备文档
export const deviceData = (params, method) =>
  request({
    url: baseURL + `/device-document/page`,
    method: method,
    params,
  });

// 设备文档新增
export const deviceDataAdd = (data, method) =>
  request({
    url: baseURL + `/device-document`,
    method: method,
    data,
  });

// 设备文档删除
export const deviceDataId = (data, method) =>
  request({
    url: baseURL + `/device-document/${data?.id ? data?.id : data}`,
    method: method,
    data,
  });

// 设备文档批量删除
export const deviceDataBatch = (params, method) =>
  request({
    url: baseURL + `/device-document/batch`,
    method: method,
    params,
  });

// 类型管理
export const typeData = (params, method) =>
  request({
    url: baseURL + `/getList/BUILDING_DEVICE`,
    method: method,
    params,
  });

// 类型管理新增
export const typeDataAdd = (data, method) =>
  request({
    url: baseURL + `/addModelTypeCommand`,
    method: method,
    data: { ...data, modelType: 'BUILDING_DEVICE' },
  });

// 类型管理删除,修改
export const typeDataId = (data, method) =>
  request({
    url: baseURL + `/updateModelTypeCommand/${data?.id ? data?.id : data}`,
    method: method,
    data: method === 'delete' ? null : { ...data, modelType: 'BUILDING_DEVICE' },
  });

  // 类型删除
export const removeModelType = (data, method) =>
request({
  url: baseURL + `/removeModelType/${data?.id ? data?.id : data}`,
  method: method,
  data,
});
