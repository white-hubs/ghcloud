export const statusOptions = [
  { label: '常规', value: 'NORMAL', color: 'default' },
  { label: '超限', value: 'ABOVE', color: 'error' },
]
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

export const bottomListOptions = [
  {
    name: '中效过滤',
    code: 'mediumEfficiencyFiltration'
  },
  {
    name: '高效过滤',
    code: 'efficientFiltration'
  },
  {
    name: '自净时间',
    code: 'selfPurificationTime'
  },
  {
    name: '换气次数',
    code: 'airChanges'
  },
  {
    name: '工作台面风速',
    code: 'averageWindSpeed'
  },
  {
    name: '噪声',
    code: 'noise'
  },
  {
    name: '照度',
    code: 'illuminance'
  }
]
export const rightListOptions = [
  {
    name: '洁净等级',
    code: 'cleanlinessLevel'
  },
  {
    name: '0.5um',
    code: '0.5um'
  },
  {
    name: '1.0um',
    code: '1.0um'
  },
  {
    name: '5.0um',
    code: '5.0um'
  },
]

export interface RealTimeMonitorList {
  areaId?: number;
  details: NormData[];
  id?: number;
  operatingRoomName?: string;
  status?: string;
  cleanlinessLevel?: string;
  '0.5um'?: string;
  '1.0um'?: string;
  '5.0um'?: string;
}
/**
 * 指标详情
 *
 * NormDataVO
 */
export interface NormData {
  /**
   * 指标编码
   */
  normCode?: string;
  /**
   * 指标名称
   */
  normName?: string;
  /**
   * 指标状态:NORMAL("正常"),LOWER_LIMIT("下限"),UPPER_LIMIT("上限")
   */
  status?: string;
  /**
   * 指标单位
   */
  unit?: string;
  /**
   * 指标数值
   */
  value?: number;
  display?: number;
}

export interface TrendsCode {
  'interiorPressure': string;
  'temperature': string;
  'humidity': string;
  'airVolume': string;
  'traceHarmfulGases': string;
  'oxygenConcentration': string;
  'mediumEfficiencyFiltration': string;
  'efficientFiltration': string;
  'selfPurificationTime': string;
  'airChanges': string;
  'averageWindSpeed': string;
  'noise': string;
  'illuminance': string;
}
