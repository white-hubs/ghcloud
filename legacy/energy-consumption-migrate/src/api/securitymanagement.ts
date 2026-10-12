import { request } from '@/service/index'

let baseURL = "/securitymanagement";

//设备关联-列表选项批量
export const addBatchSecurityDevice = (data:any) =>
  request.post( baseURL + `/add-security-device`,data);
