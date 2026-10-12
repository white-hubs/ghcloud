import { request } from '@/service/index'
import type { LocationQueryValue } from 'vue-router'
import { getId } from '@/utils/permission'
const baseUrl = '/maintain'
/** 系统配置 通用分类分页查询 */
export const getPalnPage = async (data: Plan.GetList): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/getPalnPage', {
    headers: {
      Permission: getId()

    },
    params: {
      ...data
    }
  })
}
export const addplan = async (data: Plan.AddPlan): Promise<Service.RequestResult> => {
  return request.post(baseUrl + '/electron/plan/add',
    data
  )
}
// 巡更计划编辑
export const updatePlan = async (data: Plan.AddPlan): Promise<Service.RequestResult> => {
  return request.put(baseUrl + '/electron/plan/update',
    data
  )
}
export const addplanone = async (id: string | LocationQueryValue[]): Promise<Service.RequestResult> => {
  return request.get(baseUrl + `/electron/plan/${id}`,
    {}
  )
}
export const calcPeriod = async (params: {
  startStr: string;
  endStr: string;
  intervalHour: number;

}): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/task/calcPeriod',
    { params }
  )
}
export const stopOr = async (data: { id: string;status: string; }): Promise<Service.RequestResult> => {
  return request.put(baseUrl + '/electron/plan',
    data
  )
}
export const deletePlan = async (id: string): Promise<Service.RequestResult> => {
  return request.delete(baseUrl + `/electron/plan/delete/${id}`, {
  })
}
export const getPalnStatus = async (): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/getPalnStatus', {
    headers: {
      Permission: getId()

    },
  })
}
export const getexam = async (): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/electron/plan/attendance', {
  })
}
