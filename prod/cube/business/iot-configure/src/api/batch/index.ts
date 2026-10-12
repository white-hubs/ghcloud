import { request } from '@/service'
/** getwaytree */
export const listAggregationRowByCtlId = async (ctlIds: string) => {
  return request.get('/aggregation/listAggregationRowByCtlId', {
    params: {
      ctlIds
    }
  })
}

export const saveOrUpdateAggregationRow = async (data: any) => {
  return request.post('/aggregation/saveOrUpdateAggregationRow', data)
}
