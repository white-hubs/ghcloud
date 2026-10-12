import { request } from '@/service'

/** 通道-通信协议&通信接口 */
export const getChannelAppLink = async (pluginCode?: string): Promise<Service.RequestResult> => {
  return request.get('/protocol/chlProtocolCascade', {
    params: { pluginCode }
  })
}
/** 通道-动态配置元 */
export const getChannelSchema = async (data: {
  commCode?: string;
  interfaceCode?: string;
  pluginCode?: string;
}): Promise<Service.RequestResult> => {
  return request.get('/protocol/chlDynamicCfgSchema', {
    params: data
  })
}
/** 通道-创建 */
export const createChannel = async (data: {
  channelName?: string;
  chlProtocolCode?: string;
  chlProtocolId?: string | number;
  gwId?: string | number;
  interfaceCode?: string;
  interfaceId?: string | number;
  appConfig?: string;
  linkConfig?: string;
  remark?: string;
}): Promise<Service.RequestResult> => {
  return request.post('/channel/createChannel', data)
}

/** 通道-修改 */
export const updateChannel = async (data: {
  channelId?: string | number;
  channelName?: string;
  appConfig?: string;
  linkConfig?: string;
  remark?: string;
}): Promise<Service.RequestResult> => {
  return request.post('/channel/updateChannel', data)
}

/** 通道-详情 */
export const channelDetail = async (data: {
  channelId?: string | number;
}): Promise<Service.RequestResult> => {
  return request.get('/channel/channelDetail', {
    params: {
      data
    }
  })
}

/** 控制器-动态配置元 */
export const getControllerSchema = async (data: {
  channelId?: string | number;
}): Promise<Service.RequestResult> => {
  return request.get('/controller/ctlSpec', {
    params: {
      data
    }
  })
}
/** 控制器-创建 */
export const createController = async (data: {
  chlId?: string | number;
  ctlCode?: string;
  ctlName?: string;
  appConfig?: string;
  linkConfig?: string;
  remark?: string;

}): Promise<Service.RequestResult> => {
  return request.post('/controller/createController', data)
}

/** 控制器-修改 */
export const updateController = async (data: {
  ctlId?: string | number;
  ctlCode?: string;
  ctlName?: string;
  appConfig?: string;
  linkConfig?: string;
  remark?: string;
}): Promise<Service.RequestResult> => {
  return request.post('/controller/updateController', data)
}

/** 控制器-详情 */
export const controllerDetail = async (data: {
  controllerId?: string | number;
}): Promise<Service.RequestResult> => {
  return request.get('/controller/headDetailOfController', {
    params: {
      data
    }
  })
}

/** 变量-创建 */
export const createVar = async (data: {
  ctlId?: string | number;
  dataType?: string | undefined;
  varCode?: string;
  varName?: string;
  enable?: string | number;
  gwId?: string | number;
  readType?: string | number;
  appConfig?: string;
  linkConfig?: string;
  remark?: string;
  convertStyleConfig?: {
    precision?: string | number;
    zoomExpression?: string | number;
  };
  reportStrategyConfig?: {
    reportStrategy?: string | undefined;
    intervalReportMill?: string | number;
    changeUpVal?: string | number;
  };
}): Promise<Service.RequestResult> => {
  return request.post('/var/createVar', data)
}

/** 变量-修改 */
export const updateVar = async (data: {
  varId?: string | number;
  ctlId?: string | number;
  dataType?: string | undefined;
  varCode?: string;
  varName?: string;
  enable?: string | number;
  gwId?: string | number;
  readType?: string | number;
  appConfig?: string;
  linkConfig?: string;
  remark?: string;
  convertStyleConfig?: {
    precision?: string | number;
    zoomExpression?: string | number;
  };
  reportStrategyConfig?: {
    reportStrategy?: string | undefined;
    intervalReportMill?: string | number;
    changeUpVal?: string | number;
  };
}): Promise<Service.RequestResult> => {
  return request.post('/var/updateVar', data)
}

/** 变量-详情 */
export const varDetail = async (data: {
  varId?: string | number;
}): Promise<Service.RequestResult> => {
  return request.get('/var/varDetail', {
    params: {
      data
    }
  })
}
/** 变量-数据类型 */
export const getVarDataType = async (): Promise<Service.RequestResult> => {
  return request.get('/var/varDataType', {
    params: {}
  })
}

/** 变量-动态配置元 */
export const getValSchema = async (data: {
  controllerId?: string | number;
}): Promise<Service.RequestResult> => {
  return request.get('/var/varSpec', {
    params: {
      data
    }
  })
}
