
import { request } from '@/service/index'
/** 消息配置2.0 查询 */
export const getMessageConfigInfo = async (params:{lable?:string,businessType: string}): Promise<
  Service.RequestResult<unknown>
> => {
  return request.get(
    "/bracing/message/getConfigInfo",{params}
  );
};

/** 消息配置2.0 保存 */
export const saveMessageConfig = async (params:unknown): Promise<
  Service.RequestResult<unknown>
> => {
  return request.post(
    "/bracing/message/addConfig",params
  );
};
/** 消息配置2.0 通知方式code */
export const getNoticeCode = async (code:string): Promise<
  Service.RequestResult<{channelCodes:string[]}>
> => {
  return request.get(
    `/message2/sat-msg-scene-receive/code/${code}`
  );
};