import { storeCache } from '@/store/cache'
import { type CubeOperatingRoomMqttSubscribeService, DevicePropStatus, type MqttReceiveMsg, CorrectState } from '@ghcloud/cube-operating-room-service'
import { message } from 'ant-design-vue'
import { ref, onMounted, type Ref, onBeforeUnmount, computed, type ComputedRef } from 'vue'
import { retainDecimals } from './use-utils'
import type { ProductPropVo } from '@ghcloud/cube-iot-center-service'

export interface DevicePropsForUI {
  code: string;
  /** 值 */
  value: number | undefined;
  /** 单位 */
  unit: string;
  /** 状态 */
  status: DevicePropStatus;
  /** 名称 */
  name: string;
  /** 是否显示 */
  display: boolean;
  /** 显示区域 */
  showArea: string | number | null | undefined;
  /** 排序 */
  sort: number;
  limitRange?: string;
  valueText?: string | undefined;
}

interface UseProps {
  deviceMqttData: Ref<MqttReceiveMsg | undefined>;
  /** 异常指标数量 */
  abnormalNum: ComputedRef;
  /** 回显数据组装 */
  getDeviceProps: ComputedRef<DevicePropsForUI[]>;
  /** 手术室匹配规则 */
  rule: ComputedRef;
  /** 信号是否有效 */
  effective: ComputedRef;
  unSubscribe: () => void;
  subscribe: () => void;
}

export let mqttServiceInstance: CubeOperatingRoomMqttSubscribeService | null = null
export const mqttInit = (mqttService: CubeOperatingRoomMqttSubscribeService): void => {
  const cacheStore = storeCache()
  mqttServiceInstance = mqttService
  if (!cacheStore.mqttService.ipcUrl) {
    message.error('未获取到工控机相关信息或信息不完整')
    throw new Error('未获取到工控机相关信息或信息不完整')
  }
  mqttServiceInstance.createConnection({
    ipcUrl: cacheStore.mqttService.ipcUrl,
    ipcAccount: cacheStore.mqttService.ipcAccount ?? '',
    ipcPassword: cacheStore.mqttService.ipcPassword ?? '',
  })
}
export const mqttDisposed = (): void => {
  mqttServiceInstance?.dispose()
  mqttServiceInstance = null
}

export const useProps = (deviceCode: string, deviceId: string): UseProps => {
  const cacheStore = storeCache()
  const deviceMqttData: Ref<MqttReceiveMsg | undefined> = ref()
  const effective = computed(() => {
    return getPropValByPropCode.value('effective') ?? true
  })
  onMounted(() => {
    subscribe()
  })

  onBeforeUnmount(() => {
    unSubscribe()
  })

  const subscribe = (): void => {
    if (deviceCode) {
      mqttServiceInstance?.subscribe(deviceCode)
      mqttServiceInstance?.emitter.on(deviceCode, res => {
        const data = res as MqttReceiveMsg
        data.props = data.props.map(item => {
          return {
            ...item,
            ts: 0
          }
        })
        deviceMqttData.value = data
      })
    }
  }
  const unSubscribe = (): void => {
    if (deviceCode) {
      mqttServiceInstance?.unSubscribe(deviceCode)
    }
  }

  /** 获取属性的产品属性 */
  const getCurProductProp = (propCode: string): ProductPropVo | null => {
    let curProp = null
    const curDevice = cacheStore.roomList.find((d) => d?.deviceId === deviceId)
    if (curDevice) {
      const curProd = cacheStore.productList.find((p) => p?.prodId === curDevice.deviceProdId)
      if (curProd?.productPropVoList) {
        curProp = curProd.productPropVoList.find((p) => p.propCode === propCode) ?? null
      }
    }
    return curProp
  }
  const getPropValByPropCode = computed(() => {
    return (propCode: string): number | undefined => {
      if (!deviceMqttData.value) return undefined
      const findProp = deviceMqttData.value.props.find(e => e.propCode === propCode)
      const correctValue = getCorrectValue.value(propCode)
      let res = findProp?.propVal
      if (correctValue !== 0) {
        res = (res ?? 0) + correctValue
      }
      const resVal = propCode === 'effective' || (res === undefined || res === null) ? res : retainDecimals(res ?? 0, getPrecision.value(propCode) ?? 0)
      return resVal
    }
  })
  const getPropValTextByPropCode = computed(() => {
    return (propCode: string): string | undefined => {
      if (!deviceMqttData.value) return undefined
      const findProp = deviceMqttData.value.props.find(e => e.propCode === propCode)
      const correctValue = getCorrectValue.value(propCode)
      let res = findProp?.propVal
      if (correctValue !== 0) {
        res = (res ?? 0) + correctValue
      }
      let resValText = ''
      const curProductProp = getCurProductProp(propCode)
      if (['enum', 'boolean'].includes(curProductProp?.dataType ?? '')) {
        resValText = curProductProp?.dataConstraint.find(d => d.value === res)?.label ?? ''
      }
      return resValText
    }
  })
  /** 检查设备属性的状态 */
  const checkPropsStatus = (propCode: string, propVal: number | undefined): DevicePropStatus => {
    if (typeof propVal === 'undefined') return DevicePropStatus.NORMAL
    if (!rule.value) return DevicePropStatus.NORMAL
    const findProp = rule.value.ruleNormList.find(item => item.normCode === propCode)
    if (!findProp) {
      return DevicePropStatus.NORMAL
    }
    if (findProp.lowerLimit !== undefined && findProp.lowerLimit !== null && findProp.lowerLimit > propVal) {
      return DevicePropStatus.LOWER_LIMIT
    }
    if (findProp.upperLimit !== undefined && findProp.upperLimit !== null && findProp.upperLimit < propVal) {
      return DevicePropStatus.UPPER_LIMIT
    }
    return DevicePropStatus.NORMAL
  }

  /** 匹配当前手术室的规则 */
  const rule = computed(() => {
    // TODO 指标需要过滤掉特殊指标
    const list = cacheStore.rules.map(rule => {
      const curSpecialNormCodes = cacheStore.specialList.filter(s => s.productId === rule.productId).map(s => s.normCode)
      const curRules = rule.ruleNormList.filter(r => !curSpecialNormCodes.includes(r.normCode))
      return {
        ...rule,
        ruleNormList: curRules
      }
    })
    return list.find((rule) => rule.deviceIds.includes(deviceId)) ?? { ruleNormList: [] }
  })

  /** 匹配指标设置 */
  const getCorrectValue = computed(() => {
    return (propCode: string): number => {
      const correct = cacheStore.correctList.length > 0
        ? cacheStore.correctList.filter(e => e.state === CorrectState.VAILD).find((correct) => {
          const deviceIds = correct?.deviceId || correct?.device?.deviceList?.map(e => e?.id || e?.deviceId)
          return deviceIds?.includes(deviceId) && correct.normCode === propCode
        })
        : undefined
      return Number(correct?.correctValue ?? 0)
    }
  })
  /** 匹配指标精度 */
  const getPrecision = computed(() => {
    return (propCode: string): number | null => {
      let precision = null
      const curDevice = cacheStore.roomList.find((d) => d?.deviceId === deviceId)
      if (curDevice) {
        const curProd = cacheStore.productList.find((p) => p?.prodId === curDevice.deviceProdId)
        if (curProd?.productPropVoList) {
          const curProp = curProd.productPropVoList.find((p) => p.propCode === propCode)
          precision = curProp?.precision ?? null
          // 整型、枚举、布尔类型，精度无效不可用
          const notPrecision = !!(curProp?.dataType && ['int', 'enum', 'boolean'].includes(curProp?.dataType))
          if (notPrecision) precision = null
        }
      }
      return precision
    }
  })

  /** 通过规则判断有多少条异常数据 */
  const abnormalNum = computed(() => {
    let num = 0

    for (const item of rule.value.ruleNormList) {
      const propCode = item.normCode ?? ''
      const propVal = getPropValByPropCode.value(propCode)
      if (typeof propVal === 'undefined') {
        continue
      }
      item.display && [DevicePropStatus.LOWER_LIMIT, DevicePropStatus.UPPER_LIMIT].includes(checkPropsStatus(propCode, propVal)) && num++
    }
    return num
  })

  /** 获取设备属性状态、值 、单位、展示区域 排序等 */
  const getDeviceProps = computed(() => {
    const res = []
    for (const item of rule.value.ruleNormList) {
      const propCode = item.normCode ?? ''
      const propVal = getPropValByPropCode.value(propCode)
      const propValText = getPropValTextByPropCode.value(propCode)
      const propItem: DevicePropsForUI = {
        code: propCode,
        value: propVal,
        unit: item.unit ?? '',
        status: checkPropsStatus(propCode, propVal),
        name: item.normName ?? '',
        display: item.display !== 0,
        showArea: item.showArea,
        sort: item.sort ?? 0,
        valueText: propValText
      }
      res.push(propItem)
    }
    return res.filter(item => item.display || (!item.display && item.code === 'airconditioner'))
  })

  return {
    deviceMqttData,
    abnormalNum,
    getDeviceProps,
    rule,
    effective,
    subscribe,
    unSubscribe
  }
}
