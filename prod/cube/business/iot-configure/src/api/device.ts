import { request } from '@/service'

/** 聚合组-分页 */
export const aggregationListPage = async (params: {
  channelId: number;
  keyword: string;
  pageSize: number;
  pageNumber: number;
}): Promise<Service.RequestResult> => {
  return request.get('/aggregation/listPage', {
    params
  })
}
/** 聚合组-分页-设备关联 */
export const aggregationListThinPage = async (params: {
  channelId: number;
  keyword: string;
  pageSize: number;
  pageNumber: number;
}): Promise<Service.RequestResult> => {
  return request.get('/aggregation/listThinPage', {
    params
  })
}
/** 聚合组-关联-修改 */
export const aggregationGroupRelModify = async (params: {
  delRelList: {
    sourceGroupId: string;
    targetGroupId: string;
  }[];
  addRelList: {
    sourceGroupId: string;
    targetGroupId: string;
  }[];
}): Promise<Service.RequestResult> => {
  return request.post('/aggregation/groupRelModify',
    params)
}
/** 聚合-实例-删除 */
export const aggregationDeleteByPrimaryKey = async (params: string): Promise<Service.RequestResult> => {
  return request.post('/aggregation/deleteByPrimaryKey',
    params)
}
/** 聚合组-详情 */
export const aggregationGroupDetail = async (params: {
  groupId: string;
}): Promise<Service.RequestResult> => {
  return request.get('/aggregation/groupDetail',
    { params })
}
/** 聚合组-实例-修改 */
export const aggregationGroupModify = async (params: { devNum: string;
  groupId: string;
  groupName: string; }[]): Promise<Service.RequestResult> => {
  return request.post('/aggregation/groupModify',
    params)
}
