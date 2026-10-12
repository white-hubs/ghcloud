import { request } from "@/service/index";
enum URL {
  /**获取人员结构数据 */
  getpersonStructureData = "/personnel/staff/stru/statistics",
  /**获取人员变动数据 */
  getpersonExchangeData = "/personnel/staff/exchange/statistics",
  /**获取部门数据 */
  getOrganizationsList = "/ouaa/authenticated/organizations/list",
  /**获取人员异动统计 */
  getStaffChangeStat = "/personnel/staff/change/stat",
  /**人员异动导出 */
  staffChangeStatExport = "/personnel/staff/change/stat/export",
  /**获取职位统计表格 */
  getAppointmentForPage = "/personnel/appointment/page",
  /**新增/编辑  职位 */
  handleAppointment = "/personnel/appointment"
}
/**
 * 获取人员结构数据
 */
export const getpersonStructureData = () => {
  return request.get(URL.getpersonStructureData);
};
/**
 * 获取人员变动数据
 */
interface exchangeParam {
  timeType: string,
  period: string,
  organizationId?: string,
}
export const getpersonExchangeData = (params: exchangeParam) => {
  return request.get(URL.getpersonExchangeData, { params });
}
/**
 * 获取部门数据
 * */
export const getOrganizationsList = () => {
  return request.get(URL.getOrganizationsList);
}
/**
 * 获取人员异动统计
 * */
interface staffChangeParam {
  period: string,
  pageSize: number,
  pageNumber: number
}
export const getStaffChangeStat = (params: staffChangeParam) => {
  return request.get(URL.getStaffChangeStat, { params });
}
/**
 * 分页获取职位表格
 * */
interface appointmentPageParam {
  enable?: boolean | null,
  keyword?: string,
  pageNumber: number,
  pageSize: number
}

export const getAppointmentForPage = (params: appointmentPageParam) => {
  return request.get(URL.getAppointmentForPage, { params });
}
interface handleAppointmentParam {
  name: string,
  remark: string
}
/**
 * 新增职位
 * */
export const handleAppointment = (data: handleAppointmentParam) => {
  return request.post(URL.handleAppointment, data);
}
/**
 * 人员异动导出
 */
interface exportParams {
  period: string
}
export const staffChangeStatExport = (data: exportParams) => {
  return request.post(URL.staffChangeStatExport, data, {
    responseType: "blob"
  });
}


// 员工分页查询
export const getStaffPage = (params:unknown) =>{
  return request.get(`/personnel/staff/page`,{params})
}

export const deptList = async (params:Record<string,unknown>) => {
  params = {
    ...params,
    enabled:true
  }
  return await request.get('/ouaa/authenticated/organizations/list',{params} )
}
export const deptTree = async (params:Record<string,unknown>) => {
  params = {
    ...params,
    enabled:true
  }
  return await request.get('/ouaa/organizations',{params} )
}

//下载模板
export const downloadTemplateFile = (data:unknown) =>{
  return request.post(`/personnel/staff/template/export`, data, {
    responseType: "blob"
  });
}
// 导出
export const batchStaffExport = (data:unknown) => {
  return request.post(`/personnel/staff/export`, data, {
    responseType: "blob"
  });
}
// 导入
export const importStaffTemplate = (data:unknown) =>{
  return request.post('/personnel/staff/template/import', data);
}

// 获取员工数据枚举数据
export const getStaffEnum = (params:unknown) =>{
  return request.get('/personnel/staff/enum/list',{params} )
}

// 岗位查询
export const getAppointmentList = (params:unknown) =>{
	params={
		enable: true,
		pageNumber: 1,
		pageSize: 1000
	}
  return request.get('/ouaa/appointment/page',{params} )
}

// 职位查询
export const getPositionList = (params:unknown) =>{
  params={
		enable: true,
		pageNumber: 1,
		pageSize: 1000
	}
  return request.get('/ouaa/positions',{params} )
}

// 查询员工详情
export const getStaffDetail = (params:{id:string},encryptionPhone=true) =>{
  return request.get( `/personnel/staff/${params?.id ?? params}`,{
    params,
    headers:{
      encryption: encryptionPhone ? 'true' : 'false'
    }
  })
}

// 新增员工  修改员工
export const postStaffInfo = (data:unknown) =>{
  return request.post('/personnel/staff', data);
}