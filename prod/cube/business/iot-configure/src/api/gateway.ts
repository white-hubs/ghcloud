import { request } from '@/service'

/** 变量列表头部 */
export const headDetailOfController = async (controllerId: string): Promise<Service.RequestResult> => {
  return request.get('/controller/headDetailOfController', {
    params: { controllerId }

  })
}
/** 变量列表 */
export const varPage = async (params: {
  ctlId: string;
  keyword: string;
  pageNumber: number;
  pageSize: number;
}): Promise<Service.RequestResult> => {
  return request.get('/var/varPage', {
    params

  })
}
/** 控制器列表 */
export const ctlPage = async (params: {
  chlId: string;
  keyword: string;
  pageNumber: number;
  pageSize: number;
}): Promise<Service.RequestResult> => {
  return request.get('/controller/ctlPage', {
    params

  })
}
/** 控制器头部 */
export const headDetailOfChannel = async (channelId: string): Promise<Service.RequestResult> => {
  return request.get('channel/headDetailOfChannel', {
    params: { channelId }

  })
}
/** 通道列表 */
export const channelPage = async (params: {
  gwId: string;
  keyword: string;
  pageNumber: number;
  pageSize: number;
  chlProtocolId: string;
  interfaceId?: string;
}): Promise<Service.RequestResult> => {
  return request.get('/channel/channelPage', {
    params: { ...params }

  })
}
/** 变量删除 */
export const deleteVar = async (varId: string): Promise<Service.RequestResult> => {
  return request.post('var/deleteVar', varId)
}
/** 控制器删除 */
export const delController = async (channelId: string): Promise<Service.RequestResult> => {
  return request.post('controller/delController', channelId)
}
/** 控制器强力删除 */
export const emptyController = async (controllerId: string): Promise<Service.RequestResult> => {
  return request.get('force-del/delControllerById', { params: { controllerId } })
}
/** 通道强力删除 */
export const emptyChannel = async (channelId: string): Promise<Service.RequestResult> => {
  return request.get('force-del/delChannelById', { params: { channelId } })
}
/** 通道删除 */
export const deleteChannel = async (channelId: string): Promise<Service.RequestResult> => {
  return request.post('/channel/deleteChannel', channelId)
}
/** 通道详情 */
export const chlProtocolCascade = async (pluginCode: string): Promise<Service.RequestResult> => {
  return request.get('/protocol/chlProtocolCascade', {
    params: { pluginCode }

  })
}
/** 通道详情 */
export const headDetailOfGateway = async (gwId: string): Promise<Service.RequestResult> => {
  return request.get('/gateway/headDetailOfGateway', {
    params: { gwId }

  })
}
/** 网关卡片列表 */
export const getGetwayList = async (): Promise<Service.RequestResult> => {
  return request.post('/gateway/gatewayList', {})
}

/** 批量更新网关下变量上报策略 */
export const updateReportTacticsByGateway = async (data: {
  gatewayId: string | number;
  dynamicReportStrategy: {
    changeUpVal: number | null;
    intervalReportMill: number | null;
    reportStrategy: string | null;
  };
}): Promise<Service.RequestResult> => {
  return request.post('/gateway/updateReportTacticsByGateway', data)
}

/** 同步网关下设备策略 */
export const syncSchemaByGw = async (gwId: string | number): Promise<Service.RequestResult> => {
  return request.post('/gateway/syncSchemaByGw', gwId)
}
/** 网关-工作状态-切换 */
export const updateSwitchState = async (data: {
  gwId: string | number;
  state: string | number;
}): Promise<Service.RequestResult> => {
  return request.post('/gateway/switchState', data)
}

/** 网关-插件协议列表 */
export const getPluginProtocolList = async (): Promise<Service.RequestResult> => {
  return request.get('/gateway/pluginProtocolList')
}

/** 网关-创建 */
export const createGateway = async (data: {
  deviceNum: string;
  name: string;
  pluginCode: string;
  secret: string;
  remark?: string;
  gwConfig?: string;
}): Promise<Service.RequestResult> => {
  return request.post('/gateway/createGateway', data)
}
/** 网关-修改 */
export const updateGateway = async (data: {
  deviceNum: string;
  id: string | number;
  name: string;
  secret: string;
  remark?: string;
  gwConfig?: string;
}): Promise<Service.RequestResult> => {
  return request.post('/gateway/updateGateway', data)
}

/** 网关-删除 */
export const deleteGateway = async (gwId: string | number): Promise<Service.RequestResult> => {
  return request.post('/gateway/deleteGateway', gwId)
}

/** 网关-动态配置元 */
export const getDynamicCfgSchema = async (data: {
  pluginCode?: string;
}): Promise<Service.RequestResult> => {
  return request.get('/protocol/gwDynamicCfgSchema', {
    params: {
      data
    }
  })
}

/** 网关-详情 */
export const gatewayDetail = async (data: {
  gwId?: string | number;
}): Promise<Service.RequestResult> => {
  return request.get('/gateway/detailOfGateway', {
    params: {
      data
    }
  })
}
/** 模板下载-控制器 */
export const excelExportCtlTemplate = async (params: {
  channelId: string ;
}): Promise<Service.RequestResult> => {
  return request.get('/excel/exportCtlTemplate', {
    params
  })
}
/** 模板下载-控制器&变量 */
export const excelExportCtlAndVarTemplate = async (params: {
  channelId: string ;
}): Promise<Service.RequestResult> => {
  return request.get('/excel/exportCtlAndVarTemplate', {
    params
  })
}
/** 模板导入-控制器 */
export const excelImportCtl = async (params: {
  channelId: string ;
  file: any;
}): Promise<Service.RequestResult> => {
  return request.post('excel/importCtl',
    params,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
}
/** 模板导入-控制器&变量 */
export const excelImportCtlAndVar = async (params: {
  channelId: string ;
  file: any;
}): Promise<Service.RequestResult> => {
  return request.post('/excel/importCtlAndVar',
    params,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
}
