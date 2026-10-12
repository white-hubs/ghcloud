import request from '@/utils/request'
let baseURL = '/api/management'

// 公告类型列表
export const noticeType = (params, method = 'get') =>
  request({
    url: baseURL + `/getList/ANNOUNCEMENT`,
    method: method,
    params
  })

// 公告类型修改
export const noticeTypeId = (data, method = 'put') =>
  request({
    url: baseURL + `/updateModelTypeCommand/${data?.id ? data?.id : data
      }`,
    method: method,
    data: { ...data, modelType: 'ANNOUNCEMENT' }
  })

// 公告类型新增
export const noticeTypeAdd = (data, method = 'post') =>
  request({
    url: baseURL + `/addModelTypeCommand`,
    method: method,
    data: { ...data, modelType: 'ANNOUNCEMENT' }
  })

// 公告标签列表
export const noticeLabel = (params, method = 'get') =>
  request({
    url: baseURL + `/getList/ANNOUNCEMENT_TAG`,
    method: method,
    params
  })

// 公告标签修改
export const noticeLabelId = (data, method = 'put') =>
  request({
    url: baseURL + `/updateModelTypeCommand/${data?.id ? data?.id : data
      }`,
    method: method,
    data: { ...data, modelType: 'ANNOUNCEMENT_TAG' }
  })

// 公告标签新增
export const noticeLabelAdd = (data, method = 'post') =>
  request({
    url: baseURL + `/addModelTypeCommand`,
    method: method,
    data: { ...data, modelType: 'ANNOUNCEMENT_TAG' }
  })
// 发布机构列表
export const noticeInstitution = (params, method = 'get') =>
  request({
    url: baseURL + `/getList/PUBLISH_AGENCY`,
    method: method,
    params
  })

// 发布机构修改
export const noticeInstitutionId = (data, method = 'put') =>
  request({
    url: baseURL + `/updateModelTypeCommand/${data?.id ? data?.id : data
      }`,
    method: method,
    data: { ...data, modelType: 'PUBLISH_AGENCY' }
  })

// 发布机构新增
export const noticeInstitutionAdd = (data, method = 'post') =>
  request({
    url: baseURL + `/addModelTypeCommand`,
    method: method,
    data: { ...data, modelType: 'PUBLISH_AGENCY' }
  })


// 公告信息
export const noticeInfo = (params, method = 'post') =>
  request({
    url: baseURL + `/announcement/page`,
    method: method,
    params
  })

// 公告信息详情,删除
export const noticeInfoId = (params, method = 'post') =>
  request({
    url: baseURL + `/announcement/${params?.id ? params?.id : params}`,
    method: method,
    params
  })

// 类型删除
export const removeModelType = (params, method = 'delete') =>
  request({
    url: baseURL + `/removeModelType/${params?.id ? params?.id : params}`,
    method: method,
    params
  })

// 公告信息批量删除
export const noticeInfoBatch = (params, method = 'post') =>
  request({
    url: baseURL + `/announcement/bath`,
    method: method,
    params
  })
// 公告修改-置顶、隐藏
export const updateHideTop = (params, method = 'post') =>
  request({
    url: baseURL + `/announcement/update/hide-top`,
    method: method,
    data:params
  })

// 公告信息新增
export const noticeInfoAdd = (data, method = 'post') =>
  request({
    url: baseURL + `/announcement`,
    method: method,
    data
  })

// 配置

// 公告级别
export const noticeLevel = (params, method = 'get') =>
  request({
    url: baseURL + `/getAnnouncementLevels`,
    method: method,
    params
  })

export const getRoleList = (params, method = "get") =>
  request({
    url: `/api/ouaa/authenticated/product/role/page`,
    method: method,
    params,
  });
  // 用户管理接口 - 查询企业员工
export const tenantUsers = (params, method = "get") =>
  request({
    url: "/api/ouaa/authenticated/user-under-tenant/page",
    method: method,
    params: {
      ...params,
      enable: true
    },
  });