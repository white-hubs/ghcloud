 
export enum DevicePropCodeEnum {
/** ups状态 */
  UPS_STATUS = 'ups_status',
  /** ups工作模式 */
  WORK_MODE = 'work_mode',
  /** 电池后备时间 */
  BAT_TIME = 'bat_time',
  /** 电池状态 */
  BAT_STATUS = 'bat_status',
  /** 电池剩余容量百分比 */
  BAT_CAP_P = 'bat_cap_p',
  /** 电池剩余容量 */
  BAT_CAP = 'bat_cap',
  BAT_CURRENT = 'bat_current',
  /** 电池温度 */
  BAT_TEMP = 'bat_temp',
  /** 电池电压 */
  BAT_VOLTAGE = 'bat_voltage',
  /** UPS负载 */
  OUT_LOAD_P = 'out1_load_p',
  /** 输出有工总功率 */
  OUT_P = 'out1_p',
  OUT_PA = 'out1_pa',
  OUT_PB = 'out1_pb',
  OUT_PC = 'out1_pc',
  /** 输入有工总功率 */
  IN_P = 'in1_p',
  IN_PA = 'in1_pa',
  IN_PB = 'in1_pb',
  IN_PC = 'in1_pc',
  /** 输出频率 */
  OUT_FR = 'out1_fr',
  /** 输入频率 */
  IN_FR = 'in1_fr',
  /**
   * 输入电压
   */
  IN_U = 'in1_u',
  IN_UA = 'in1_ua',
  IN_UB = 'in1_ub',
  IN_UC = 'in1_uc',
  /**
   * 输出电压
   */
  OUT_U = 'out1_u',
  OUT_UA = 'out1_ua',
  OUT_UB = 'out1_ub',
  OUT_UC = 'out1_uc',
  /** 输入电流 */
  IN_I = 'in1_i',
  IN_IA = 'in1_ia',
  IN_IB = 'in1_ib',
  IN_IC = 'in1_ic',
  /** 输出电流 */
  OUT_O = 'out1_i',
  OUT_OA = 'out1_ia',
  OUT_OB = 'out1_ib',
  OUT_OC = 'out1_ic'
}

export interface DeviceTemp {
  temp: number;
  hum: number;
}
export type BatteryCode = Record<string, string>
export interface DeviceAttrItem {
  propCode: string;
  propName: string;
  propValue: string;
  unitName: string;
  newCode: string;
  dataConstraint: number[];
}
/**
 * UPS状态
 */
export function getUpsType (list: {
  propCode: string;
  dataConstraint: { label: string; value: string; }[] | number[];
}[], code: string): string {
  const dataConstraint = list.find(x => x.propCode === 'ups_status')?.dataConstraint ?? null
  let res = ''
  if (dataConstraint) {
    res = (dataConstraint as { label: string; value: string; }[]).find(x => x.value === code)?.label ?? ''
  }
  return res
}
/**
 * UPS工作模式
 *
 */
export function getWorkMode (list: {
  propCode: string;
  dataConstraint: { label: string; value: string; }[] | number[];
}[], code: string): string {
  const dataConstraint = list.find(x => x.propCode === 'work_mode')?.dataConstraint ?? null
  let res = ''
  if (dataConstraint) {
    res = (dataConstraint as { label: string; value: string; }[]).find(x => x.value === code)?.label ?? ''
  }
  return res
}
export function getBatMode (list: {
  propCode: string;
  dataConstraint: { label: string; value: string; }[] | number[];
}[], code: string): string {
  const dataConstraint = list.find(x => x.propCode === 'bat_status')?.dataConstraint ?? null
  let res = ''
  if (dataConstraint) {
    res = (dataConstraint as { label: string; value: string; }[]).find(x => x.value === code)?.label ?? ''
  }
  return res
}

export function filterU (arr: { propCode: string; }[], one = false): {
  inv: { propCode: string; }[];
  outv: { propCode: string; }[];

} {
  /**
   * 过滤输入电压
   */
  const involtage = one ? /in\d_u/ : /in\d+_u[abc]/
  const inv: { propCode: string; }[] = []
  /**
   * 输出电压
   */
  const outvoltage = one ? /out\d_u/ : /out\d+_u[abc]/
  const outv: { propCode: string; }[] = []

  arr.forEach((ele: {
    propCode: string;
  }) => {
    if (involtage.test(ele.propCode)) {
      inv.push(ele)
    } else if (outvoltage.test(ele.propCode)) {
      outv.push(ele)
    }
  })
  return {
    inv,
    outv,
  }
}
export function filterSame (arr: { propCode: string; }[]): { propCode: string; }[][] {
  return arr.map((value, index) => {
    return arr.slice(index * 3, (index + 1) * 3)
  }).filter(item => item.length > 0)
}
export function convertSeconds (seconds: string): string {
  const hours = Math.floor(parseInt(seconds) / 3600) || 0
  const minutes = Math.floor((parseInt(seconds) % 3600) / 60) || 0
  const secs = parseInt(seconds) % 60 || 0
  return `${hours}小时${minutes}分钟 ${secs}秒`
}

export function batteryfilter (arr: DeviceAttrItem[]): DeviceAttrItem[] {
  const batteryAttr = ['bat_u', 'bat_i', 'bat_temp', 'bat_time']
  const batterylist: DeviceAttrItem[] = []
  arr.forEach((ele: DeviceAttrItem) => {
    if (batteryAttr.includes(ele.propCode)) {
      batterylist.push(ele)
    }
  })
  return batterylist
}

export function groupArray (arr: DeviceAttrItem[]): DeviceAttrItem[][] {
  const newarr = arr.map(item => {
    item.newCode = item.propCode.split('_')[0]
    return item
  })

  const arrayTwo: DeviceAttrItem[][] = Object.values(newarr.reduce((res: Record<string, DeviceAttrItem[]>, item) => {
    res[item.newCode] ? res[item.newCode].push(item) : res[item.newCode] = [item]
    return res
  }, {}))
  return arrayTwo
}
export function findBatterCodeIndex (arr: { propCode: string;newCode: string; }[], code: string): number {
  const index = arr.findIndex(item => item.propCode === code)
  return index
}
export function handleNull (code: null | '' | undefined | string): number {
  const number = code === null || code === undefined || code === '' ? 0 : parseInt(code)
  return number
}
