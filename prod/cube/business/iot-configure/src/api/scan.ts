import { request } from '@/service'
import type { ScanCtlResultData, ScanVarResultListData } from '@/typings/gateway'
/** getwaytree */
export const ctlAndVarScanParam = async (channelId: string): Promise<Service.RequestResult> => {
  return request.get('/channel/ctlAndVarScanParam', {
    params: {
      channelId
    }
  })
}
export const scanVarParamSchema = async (channelId: string): Promise<Service.RequestResult> => {
  return request.get('/controller/scanVarParamSchema', {
    params: {
      channelId
    }
  })
}
// 控制器&变量-扫描-发起
export const scanCtlAndVar = async (data: {
  channelId: string;
  scanParam: { config: object;
    retryTimes: number | null;
    timeOut: number | null;
    taskType: number | null; };
}): Promise<Service.RequestResult> => {
  return request.post('/channel/scanCtlAndVar', data)
}
export const scanVar = async (data: {
  controllerId: string;
  scanParam: { config: object;
    retryTimes: number | null;
    timeOut: number | null;
    taskType: number | null; };
}): Promise<Service.RequestResult> => {
  return request.post('/controller/scanVar', data)
}
// 控制器&变量-扫描-查询扫描状态

export const scanVarResult = async (taskId: string): Promise<Service.RequestResult> => {
  return request.get('/controller/scanVarResult', {
    params: {
      taskId
    }
  })
}
export const scanResult = async (taskId: string): Promise<Service.RequestResult> => {
  return request.get('/channel/scanResult', {
    params: {
      taskId
    }
  })
}
export const fetchScanVarResult = async (taskId: string, controllerId: string): Promise<Service.RequestResult> => {
  return request.get('/controller/fetchScanVarResult', {
    params: {
      taskId,
      controllerId
    }
  })
}
export const fetchScanResult = async (taskId: string, controllerId: string): Promise<Service.RequestResult> => {
  return request.get('/channel/fetchScanResult', {
    params: {
      taskId,
      channelId: controllerId
    }
  })
}
export const saveScanResult = async (data: {
  channelId: string;
  ctlAndVarParamList: {
    scanControllerId: string;
    scanVarId: string;
  }[];
}): Promise<Service.RequestResult> => {
  return request.post('/channel/saveScanResult', data)
}
export const saveScanVarResult = async (data: {
  controllerId: string;
  gatewayId: string;
  varParamList: string[];
}): Promise<Service.RequestResult> => {
  return request.post('/controller/saveScanVarResult', data)
}

// 过滤指定变量下拉框数据
export const fetchScanResultDeduplicate = async (params: {
  taskId: string;
  controllerId?: string;
}): Promise<Service.RequestResult> => {
  return request.get('/channel/fetchScanResultDeduplicate', {
    params
  })
}
export const fetchScanResultList = async (params: {
  channelId?: string | number;
  ctlKeywords?: string;
  onlyVarCodes?: string[];
  taskId?: string | number;
  varKeywords?: string;
}): Promise<Service.RequestResult<ScanCtlResultData>> => {
  return request.get('/channel/fetchScanResult', {
    params
  })
}
export const fetchScanVarResultList = async (params: {
  controllerId?: string | number;
  onlyVarCodes?: string[];
  taskId?: string | number;
  varKeywords?: string;
}): Promise<Service.RequestResult<ScanVarResultListData>> => {
  return request.get('/controller/fetchScanVarResult', {
    params
  })
}