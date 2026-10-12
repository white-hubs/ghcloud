import { request } from "@/service"

let baseURL = '/personnel'

// 员工列表查询
export const getStaffList = (params: any) => {
  return request.get(
    baseURL + `/staff/list`,
    { params }
  )
}

// 员工分页查询
export const getStaffPage = (params: any) => {
  return request.get(
    baseURL + `/staff/page`,
    { params }
  )
}

// 查询员工某个字段信息
export const getStaffInfo = (params: any) => {
  return request.get(
    baseURL + `/staff/info`,
    { params }
  )
}


// 查询员工详情
export const getStaffDetail = (params: any) => {
  return request.get(
    `/ouaa/user-under-tenant/${params?.id ?? params}`
  )
}
