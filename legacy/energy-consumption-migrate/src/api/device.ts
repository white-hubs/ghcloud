import { request } from '@/service/index'
let baseURL = "/energymanagement";

export const deviceList = async (params: { instrumentType: string|undefined; deviceAreaId:  string|undefined; keyword: string; total: number; pageSize: number; pageNumber: number }): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/meter-device/page',{params})
}
export const devices = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/meter-device/devices'
  )
}
export const deleteDevices = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseURL+'/meter-device/'+id
  )
}
/**
 * 批量删除
 * @param ids
 * @returns 
 */
export const batchDelete = async (params:string[]): Promise<Service.RequestResult> => {
  return request.post(baseURL+'/meter-device/batchdelete',params)
}
/**
 * 仪表添加
 * 
 */
export const meterAdd =async (data: any): Promise<Service.RequestResult>  =>
  request.post(baseURL+`/meter-device/batchAdd`,data)
/**
 * 查询换表记录
 * 
 */
export const TableRecordPage = async (params: any): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/meter-device-change-log/page',{
    params:{
      ...params}
  }
  )
}
//配置上级仪表
export const setParentDevice = async (params: {id:string,parentId:string|undefined}): Promise<Service.RequestResult> => {
  return request.put(`/energymanagement/meter-device/config/superiorInstrument/${params.id}/${params.parentId}`,{

  })
}
//获取非子集仪表(不包含自己)
export const getParentList = async (deviceId: string,instrumentType:string): Promise<Service.RequestResult> => {
  return request.get(`/energymanagement/meter-device/getNotChildren`,{params:{deviceId:deviceId,instrumentType:instrumentType}}
  )
}
//获取拓扑结构
export const getTopologyDiagram = async (params:{instrumentType:string}): Promise<Service.RequestResult> => {
  return request.get(`/energymanagement/meter-device/getTree`,{params}
  )
}