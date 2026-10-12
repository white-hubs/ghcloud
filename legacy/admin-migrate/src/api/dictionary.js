import request from "@/utils/request";
let baseURL = "/api/dictionary";

export const getSysDictionaryByItem = (itemCode, tenantCode) =>
  request({
    url: baseURL + `/getSysDictionaryByItem?itemCode=${itemCode}`,
    method: "get",
    headers: {
      tenant: tenantCode
    },
  });
export const getCascadeDictionaryItem = (itemCode, tenantCode) =>
  request({
    url: baseURL + `/getCascadeDictionaryItem?itemCode=${itemCode}`,
    method: "get",
    headers: {
      tenant: tenantCode
    },
  });
  export const getDataDictionaryByItemPage = (itemCode, tenantCode) =>
    request({
      url: baseURL + `/getDataDictionaryByItemPage?itemCode=${itemCode}`,
      method: "get",
      headers: {
        tenant: tenantCode
      },
    });
export const updateCascadeDictionary = (data, tenantCode) => {
  request({
    url: baseURL + `/updateCascadeDictionary`,
    data: data,
    method: "put",
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 获取所有字典项
 * @returns 
 */
export const getAllDictLst = () => {
  return request({
    url: baseURL + `/getDictionaryItemAll`,
    method: "get",
  });
}
/**
 * 新增字典项
 */
export const addDictItem = (data) => {
  return request({
    url: baseURL + `/addDictionaryItem`,
    data,
    method: "post",
  });
}
/**
 * 分页获取租户字典
 */
export const getTenantDictPage = (params, tenantCode) => {
  return request({
    url: baseURL + `/getDataDictionaryByItemPage`,
    method: "get",
    params,
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 新增数据字典 根据租户
 */
export const addDataDictionary = (data, tenantCode) => {
  return request({
    url: baseURL + `/addDataDictionary`,
    data,
    method: "post",
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 更新租户数据字典
 */
export const updateDataDictionary = (data, tenantCode) => {
  return request({
    url: baseURL + `/updateDataDictionary`,
    data,
    method: "put",
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 删除租户数据字典
 */
export const deleteDataDictionary = (id, tenantCode) => {
  return request({
    url: baseURL + `/deleteDataDictionary/${id}`,
    method: "delete",
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 分页获取系统数据字典
 */
export const getSysDataDictPage = (params) => {
  return request({
    url: baseURL + `/getSysDictionaryByItemPage`,
    method: "get",
    params,
  });
}
/**
 * 新增系统数据字典
 */
export const addSysDataDictionary = (data) => {
  return request({
    url: baseURL + `/addSysDictionary`,
    data,
    method: "post",
  });
}
/**
 * 更新系统数据字典
 */
export const updateSysDictionary = (data) => {
  return request({
    url: baseURL + `/updateSysDictionary`,
    data,
    method: "put",
  });
}
/**
 * 删除系统数据字典
 */
export const deleteSysDictionary = (id) => {
  return request({
    url: baseURL + `/deleteSysDictionary/${id}`,
    method: "delete",
  });
}
/**
 * 查询租户字典树分页
 */
export const getTenantDictionaryTreePage = (params, tenantCode) => {
  return request({
    url: baseURL + `/getCascadeDictionaryTreeByPage`,
    method: "get",
    params,
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 获取字典树
 */
export const getTenantDictionaryTree = (params, tenantCode) => {
  return request({
    url: baseURL + `/getCascadeDictionaryItem`,
    method: "get",
    params,
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 新增租户字典树
 */
export const addTenantDictionaryTree = (data, tenantCode) => {
  return request({
    url: baseURL + `/addCascadeDictionary`,
    data,
    method: "post",
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 更新租户字典树
 */
export const updateTenantDictionaryTree = (data, tenantCode) => {
  return request({
    url: baseURL + `/updateCascadeDictionary`,
    data,
    method: "put",
    headers: {
      tenant: tenantCode
    },
  });
}
/**
 * 删除租户字典树
 */
export const deleteTenantDictionaryTree = (id, tenantCode) => {
  return request({
    url: baseURL + `/deleteCascadeDictionary/${id}`,
    method: "delete",
    headers: {
      tenant: tenantCode
    },
  });
}