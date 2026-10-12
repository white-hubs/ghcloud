import { request } from "@/service";
import { getNowEnterprise } from '@/utils/auth'
let baseURL = "/ouaa";

// 部门
export const deptList = (params: any) => {
  return request.get(baseURL + `/authenticated/organizations/list`, { params });
};
export const depTree = (params: any) => {
  return request.get(baseURL + `/organizations`, { params });
};

// 职位
export const getPositionList = (params?: {
  name?: string;
  enabled?: boolean;
}) => {
  return request.get(baseURL + `/authenticated/position/list`, { params });
};

// 岗位
export const getAppointmentList = (params?: {
  name?: string;
  enable?: boolean;
  pageNumber?:number,
  pageSize?:number
}) => {
  return request.get(baseURL + `/appointment/page`, { params });
};


//获取所有人员
export const getUserForPage = (params:{
  pageSize:number,
  pageNumber:number,
}) => {
  return request.get(baseURL + `/user-under-tenant/page`, { params });
};

//获取所有应用
export const getApplicationList = () => {
  const tenant=getNowEnterprise().code;
  return request.get(baseURL + `/tenant-under-tenant/${tenant}/product-applications`);
};

//获取指定人员
export const  batchGetUserByIds = (params:{ids: string[]}) => {
  return request.post(baseURL + `/authenticated/user-under-tenant/page`, params);
}
// 根据权限获取指定人员
export const  batchGetUserByRoleIds = (params:{ids: string[]}) => {
  return request.post(baseURL + `/authenticated/role/user/page`, params);
}