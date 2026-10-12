
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

export function filterI (arr: { propCode: string; }[], one = false): {
  inv: { propCode: string; }[];
  outv: { propCode: string; }[];

} {
  /**
   * 过滤输入电流
   */
  const involtage = one ? /in\d_i/ : /in\d+_i[abc]/
  const inv: { propCode: string; }[] = []
  /**
   * 输出电流
   */
  const outvoltage = one ? /out\d_i/ : /out\d+_i[abc]/
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
  const hours = Math.floor(parseInt(seconds) / 3600)
  const minutes = Math.floor((parseInt(seconds) % 3600) / 60)
  const secs = parseInt(seconds) % 60

  return `${hours}小时${minutes}分钟 ${secs}秒`
}

export function batteryfilter (arr: { propCode: string;newCode: string; }[]): { propCode: string;newCode: string; }[] {
  const batteryAttr = ['bat_u','bat_i','bat_temp','bat_time']
  const batterylist: { propCode: string;newCode: string; }[] = []
  arr.forEach((ele: {
    propCode: string;
    newCode: string;
  }) => {
    if (batteryAttr.includes(ele.propCode)) {
      batterylist.push(ele)
    }
  })
  return batterylist
}
export const upsBatteryfilter=(arr: { propCode: string;newCode: string; }[]): { propCode: string;newCode: string; }[] =>{
  const batteryAttr = ['bat_voltage','bat_temp','bat_cap_p','bat_time']
  const batterylist: { propCode: string;newCode: string; }[] = []
  arr.forEach((ele: {
    propCode: string;
    newCode: string;
  }) => {
    if (batteryAttr.includes(ele.propCode)) {
      batterylist.push(ele)
    }
  })
  return batterylist
}

export function batteryVC (arr: { propCode: string; }[]): {
  voltage: { propCode: string; }[];
  current: { propCode: string; }[];

} {
  /**
   * 电压
   */
  const voltageReg = /bat\d_voltage/
  const voltage: { propCode: string; }[] = []
  /**
   * 电流
   */
  const currentReg = /bat\d_current/
  const current: { propCode: string; }[] = []

  arr.forEach((ele: {
    propCode: string;
  }) => {
    if (voltageReg.test(ele.propCode)) {
      voltage.push(ele)
    } else if (currentReg.test(ele.propCode)) {
      current.push(ele)
    }
  })

  return {
    voltage,
    current,
  }
}

export function groupArray (arr: { propCode: string;newCode: string; }[]): { propCode: string;newCode: string; }[][] {
  const newarr = arr.map(item => {
    item.newCode = item.propCode.split('_')[0]
    return item
  })
  const arrayTwo: { propCode: string; newCode: string; }[][] = Object.values(newarr.reduce((res: Record<string, { propCode: string; newCode: string; }[]>, item) => {
    res[item.newCode] ? res[item.newCode].push(item) : res[item.newCode] = [item]
    return res
  }, {}))
  return arrayTwo
}

export function getUnit (unitName: string): string {
  if(!unitName) return ''
  if(['百分比', '容量',  '%'].includes(unitName)) return '%'
  if(['频率', '赫兹', 'HZ'].includes(unitName)) return 'HZ'
  if(['摄氏度', '温度', '湿度'].includes(unitName)) return '°C'
  if(['电压', '电池电流'].includes(unitName)) return 'V'
  if(['毫安' ,'电流'].includes(unitName)) return 'A'
  return ''
}
