import { CubeDeviceCenterService } from './device-center.service'

export enum BuildInTagCodesEnum {
  UPS = 'builtin.usage::ups',
  // BATTERY = 'builtin.usage::battery', // TODO 未实现
  TEMP = 'builtin.usage::temp',
  FIRE = 'builtin.usage::fire',
  FIRE_WATER_PRESSURE = 'builtin.usage::fire.water_pressure.device',
  COMBUSTIBLE_GAS_MONITOR = 'builtin.usage::combustible.gas.monitor',
  LIQUID_LEVEL_SENSORS = 'builtin.usage::liquid.level.sensors',
  ELECTRICAL_MONITOR = 'builtin.usage::electrical.monitor',
}
/** 检查是否有内置仪表盘设备标签 并返回标签code */
export const checkForBuiltInDashboardTagCode = async (auth: { token: string; tenant: string; terminal: string; }, deviceId: string): Promise<BuildInTagCodesEnum | null> => {
  let code = null
  try {
    const cubeDeviceCenterService = new CubeDeviceCenterService(auth)
    const res = await cubeDeviceCenterService.getDeviceTagCode([deviceId]) as unknown as Record<string, { tags: { tagCode: string; }[]; }>
    for (const tagItem of res[deviceId].tags) {
      if (Object.values(BuildInTagCodesEnum).includes(tagItem.tagCode as BuildInTagCodesEnum)) {
        code = tagItem.tagCode as BuildInTagCodesEnum
        break
      }
    }
  } catch (error) {

  }
  return code
}
