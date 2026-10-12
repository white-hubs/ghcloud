import { request } from "@/service/index";
enum URL {
  /**获取事项类别分页 */
  getOrganizationsList = `/ouaa/authenticated/organizations/list`,
  getprocessPage='/flow/process/instance/historical/allPage'
}

/**
 * 新增事项类别
 */
export const getOrganizationsList = () => {
  return request.get(URL.getOrganizationsList);
};
export const getprocessPage = (data:{
  businessType:string
  submitTime:string
  pageNumber:number
  pageSize:number
  organizationId:string
  username:string
  applicationCode:string
}) => {
  return request.get(URL.getprocessPage,{
  params:{
  ...data}});
};
// 部门
export const deptList = async (params?: unknown): Promise<Service.RequestResult> => {
  return request.get('/ouaa/authenticated/organizations/list', { params })
}
// 岗位分页查询
export const getPositionList = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get('ouaa/authenticated/position/list', { params })
}

// 角色分页查询
export const getRoleList = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get('ouaa/authenticated/product/role/page', { params })
}


// 员工分页查询
export const getStaffPage = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get(
    '/ouaa/authenticated/user-under-tenant/page',
    { params }
  )
}