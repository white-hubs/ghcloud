import { Get, Put, Post, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'

const baseUrl = 'message'
const baseUrl1 = '/bracing'

export const satmsgconfigs = async (params: {
  satMsgDefineCodes: string;
}): Promise<BaseAPIResult> => {
  return Get(baseUrl + '/sat-msg-configs/', {
    params
  })
}
export const satmsgconfig = async (data: {
  params: {
    msgTmpContent: string;
  }[];
}): Promise<BaseAPIResult> => {
  return Put(baseUrl + '/sat-msg-config',
    data)
}
export const addsatmsgconfig = async (data: {
  params: {
    msgTmpContent: string;
  }[];
}): Promise<BaseAPIResult> => {
  return Post(baseUrl + '/sat-msg-config',
    data)
}

export const getnewmessage = async (params: {
  businessType: string;
  label: string;
}): Promise<any> => {
  return Get(baseUrl1 + '/message/getConfigInfo', {
    params: {
      ...params
    }
  })
}

export const addnewmessage = async (data: any): Promise<BaseAPIResult< { code: string; name: string; }[]>> => {
  return Post(baseUrl1 + '/message/addConfig', data)
}
/** 消息配置2.0 通知方式code */
export const getNoticeCode = async (code: string): Promise<
  any
> => {
  return Get(
    `/message2/sat-msg-scene-receive/code/${code}`
  )
}
