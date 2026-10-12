import request from "@ghcloud-legacy/bimops-fe-web-migrate-lib/lib/utils/request";
let baseURL = '/api/process'
// if (process.env.NODE_ENV === "loc") {
//   baseURL = "http://192.168.2.102:3200/process";
// }

// 流程

// 列表
export const processList = (params, method) =>
  request({
    url: baseURL + `/process-definition/list`,
    method: method,
    params,
  })

// 工单流程表单
export const processForm = (data, method = 'get') =>
  request({
    url: baseURL + `/form-value/event/${data.eventId ? data.eventId : data
      }`,
    method: method,
    data,
  })

// 工单流程输入表单
export const processInputForm = (params, method = 'get') =>
  request({
    url: baseURL + `/form/task/${params.id ? params.id : params
      }`,
    method: method,
    params,
  })

// 工单流程输入表单处理
export const processComplete = (data, method = 'get') =>
  request({
    url: baseURL + `/user-tasks/complete`,
    method: method,
    data,
  })

