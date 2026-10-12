import { makeGETRequest, makeListRequest } from '@ghcloud/cube-gateway'
import type { AreaDetail, MetadataGateway } from '@ghcloud/cube-service-interface/metadata'
import { BASE_API } from '@ghcloud/cube-protocol'

export const listAllArea: MetadataGateway['listAllArea'] = async () => {
  const resp = await makeListRequest({
    url: '/gw-bff/metadata/areas/list-all',
  }).send()
  return resp.json()
}

/** 沿用区域管理当前使用的主数据接口，尚未迁入 BFF。 */
export const getAreaById = async (id: string): Promise<AreaDetail> => {
  const resp = await makeGETRequest({
    url: `${BASE_API}/mdata/area/${encodeURIComponent(id)}`,
  }).send()
  const body = (await resp.json()) as AreaDetail | { data: AreaDetail }
  return 'data' in body ? body.data : body
}
