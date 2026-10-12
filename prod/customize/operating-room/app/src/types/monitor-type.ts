import { operatingRoomDeviceCode } from '@ghcloud/cube-operating-room-service'

export const MonitorOptions = [
  { label: '有效展示', value: 'VALID', name: 'show' },
  { label: '无效不展示', value: 'INVALID', name: 'hide' },
]
export const topList = ['interiorPressure', 'temperature', 'humidity', 'airVolume', 'traceHarmfulGases', 'oxygenConcentration']
export const bottomList = ['mediumEfficiencyFiltration', 'efficientFiltration', 'selfPurificationTime', 'airChanges', 'averageWindSpeed', 'noise', 'illuminance']

export const topListOptions = [
  {
    name: '室内压力',
    code: 'interiorPressure'
  },
  {
    name: '实时温度',
    code: 'temperature'
  },
  {
    name: '相对湿度',
    code: 'humidity'
  },
  {
    name: '新风量',
    code: 'airVolume'
  },
  {
    name: '有机挥发物',
    code: 'traceHarmfulGases'
  },
  {
    name: '氧浓度',
    code: 'oxygenConcentration'
  },
]

const getMiddleCardList = (): {
  name: string; code: string;
}[] => {
  return operatingRoomDeviceCode
    .filter(e => topListOptions.findIndex(ele => ele.code === e.code) === -1)
    .map(e => {
      return {
        name: e.title,
        code: e.code
      }
    })
}

export const bottomListOptions = getMiddleCardList()
export const rightListOptions = [
  {
    name: '洁净等级',
    code: 'cleanlinessLevel'
  },
  {
    name: '0.5μm',
    code: '05μm'
  },
  {
    name: '5.0μm',
    code: '50μm'
  },
]

export interface RealTimeMonitorList {
  areaId?: number;
  details: NormData[];
  id?: number;
  operatingRoomName?: string;
  status?: string;
  cleanlinessLevel?: string;
}
export enum DevicePropStatus {
  NORMAL = 'NORMAL', // 正常
  LOWER_LIMIT = 'LOWER_LIMIT', // 低于下限
  UPPER_LIMIT = 'UPPER_LIMIT', // 超过上限
}
/**
 * 指标详情
 *
 * NormDataVO
 */
export interface NormData {
  /**
   * 字典编码
   */
  normCode?: string;
  /**
   * 是否展示
   */
  display?: number;
  /**
   * 下限
   */
  lowerLimit?: number | null;
  /**
   * 指标名称
   */
  normName?: string;
  /**
   * 单位
   */
  unit?: string;
  /**
   * 上限
   */
  upperLimit?: number | null;
  /**
   * 展示区域
   */
  showArea?: string | number | null;
  /**
   * 展示排序
   */
  sort?: number | null;
  value: number | undefined;
  status: DevicePropStatus;
}

export interface MonitorCode {
  interiorPressure?: string;
  temperature?: string;
  humidity?: string;
  airVolume?: string;
  traceHarmfulGases?: string;
  oxygenConcentration?: string;
  mediumEfficiencyFiltration?: string;
  efficientFiltration?: string;
  selfPurificationTime?: string;
  airChanges?: string;
  averageWindSpeed?: string;
  noise?: string;
  illuminance?: string;
}
export
interface SelectValue {
  id: string;
  normName: string;
  normCode: string;
  display: boolean;
  unit: string;
  upperLimit: number | undefined;
  lowerLimit: number | undefined;
  showArea: string | number | undefined;
  sort: number | undefined;
  isEdit: boolean;
  unitError?: boolean | undefined;
  unitErrorMsg?: string | undefined;
  upperLimitError?: boolean | undefined;
  upperLimitErrorMsg?: string | undefined;
  lowerLimitError?: boolean | undefined;
  lowerLimitErrorMsg?: string | undefined;
  showAreaError?: boolean | undefined;
  showAreaErrorMsg?: string | undefined;
  sortError?: boolean | undefined;
  sortErrorMsg?: string | undefined;
  dataType?: string;
}
