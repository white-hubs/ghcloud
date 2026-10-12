import { request } from "@/service";

//设备分类
export const getDeviceGenre = () => {
  return request.get('/device/device/genre/search');
};

export const getODeviceList = async (params:unknown) => {
  return request.get('/maintain/outsource/device/list', {params})
}
/** 设备运行信息 */
export const deviceRunInfo = async (params:{ deviceInstanceId: string;}) => {
  return request.get(`/device/device/instance/${params.deviceInstanceId}/running/status`, { params })
}
