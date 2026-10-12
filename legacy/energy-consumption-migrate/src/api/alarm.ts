import { request } from '@/service/index'
let baseURL = "/alarm";

/** 报警状态分组统计 */
export const alarmStatisticsStatusGroup = async (params: {
   /**
     * 报警级别
     */
   alarmLevelId?: string;
   /**
    * 应用编号
    */
   applicationCode?: string;
   /**
    * 时间范围
    */
   period?: string;
}): Promise<Service.RequestResult> => {
  return request.get(baseURL+'/alarm-statistics/status-group',{params})
}

/** 报警级别占比 */
export const alarmStatisticsLevel = async (params: {
  /**
    * 时间范围
    */
  period?: string;
  businessType:string;
}): Promise<Service.RequestResult> => {
 return request.get(baseURL+'/alarm-statistics/level',{params})
}

/** 报警记录分页 */
export const alarmRecords = async (params: {
  applicationCode:string;
  pageNumber:number;
  pageSize:number;
  period?:string;
}): Promise<Service.RequestResult> => {
 return request.get(baseURL+'/alarm-records',{params})
}

