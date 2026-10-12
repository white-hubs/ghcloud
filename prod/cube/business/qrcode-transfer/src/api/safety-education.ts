import request from '@/utils/request'
const baseURL = '/api/safety-education'

interface SafetyCultivate {
  /**
     * 培训日期
     */
  cultivateDate?: null | string;
  /**
       * 培训时长(分钟)
       */
  cultivateDuration?: number | null;
  /**
       * 培训类型
       */
  cultivateType?: null | string;
  /**
       * 实体id
       */
  objId: string | null;
  /**
       * 参与人数
       */
  personNum?: number | null;
  /**
       * 现场照片
       */
  photo?: null | string;
  /**
       * 培训主题
       */
  themeName: string;
}
interface PhotoFile {
  path: string;
}
export type SafetyCultivateRecord = SafetyCultivate & { photoFiles: PhotoFile[]; } & { id: string; }

/** 新增安全培训记录 */
export const saveSafetyCultivate = async (data?: SafetyCultivate): Promise<void> => {
  await request({
    url: baseURL + '/safetyCultivate/save',
    data,
    method: 'POST',
  })
}

/** 安全教育统计 */
export const safetyCultivateStatistic = async (params: { objId: string;period: string; }): Promise<{ recordNum: number; }> => {
  return request({
    url: baseURL + '/safetyCultivate/statistic',
    params,
    method: 'GET',
  }) as unknown as { recordNum: number; }
}

/** 安全教育统计 */
export const safetyCultivatePage = async (params: { objId: string;pageSize: number;pageNumber: number; }): Promise<{ total: number;pages: number;records: SafetyCultivateRecord[]; }> => {
  return request({
    url: baseURL + '/safetyCultivate/page',
    params,
    method: 'GET',
  }) as unknown as { total: number;pages: number;records: SafetyCultivateRecord[]; }
}
