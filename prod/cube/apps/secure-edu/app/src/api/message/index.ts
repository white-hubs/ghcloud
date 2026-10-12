import { Get, Put, Post, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'

const baseUrl = 'message'

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
