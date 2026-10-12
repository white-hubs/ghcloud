import { request } from '@/service/index'

const baseUrl = '/dictionary'

export const getDataDictionaryByItem = async (itemCode: string, code?: string): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/getDataDictionaryByItem', {
    params: {
      itemCode,
      code
    }
  })
}

export const updateDataDictionary = async (data: unknown): Promise<Service.RequestResult> => {
  return request.put(baseUrl + '/updateDataDictionary', data)
}

export const addDataDictionary = async (data: unknown): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/addDataDictionary', data)
}
