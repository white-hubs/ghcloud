export enum PeriodStatTypeEnum {
  TODAY = 'TODAY',
  THIS_WEEK = 'THIS_WEEK',
  THIS_MONTH = 'THIS_MONTH',
  THIS_QUARTER = 'THIS_QUARTER',
  THIS_YEAR = 'THIS_YEAR'
}

export type DateUnit = 'day' | 'week' | 'month' | 'year' | 'quarter'

/**
 * 今日，本周，本月，今年统计通用参数
 */
export interface CubeStatPeriodParams {
  /**
   * 基准时间，以传入时间为准，计算不同单位下的开始和结束时间
   */
  time: Date;
  /**
   * 时间类型
   */
  type: PeriodStatTypeEnum;
}

export function toDateUnit (type: PeriodStatTypeEnum): DateUnit {
  switch (type) {
    case PeriodStatTypeEnum.TODAY:
      return 'day'
    case PeriodStatTypeEnum.THIS_WEEK:
      return 'week'
    case PeriodStatTypeEnum.THIS_MONTH:
      return 'month'
    case PeriodStatTypeEnum.THIS_YEAR:
      return 'year'
    case PeriodStatTypeEnum.THIS_QUARTER:
      return 'quarter'
    default:
      throw new Error(`unknown type ${type}`)
  }
}

/** 文件 */
export interface FileVOState {
  businessKey?: string | null;
  id: string;
  name?: null | string;
  path: string;
  refCount?: number | null;
  size?: number | null;
  suffix?: null | string;
  type?: null | string;
}

export interface PageResultState<T> {
  "total": number;
  "pages": number;
  "records": T[];
}