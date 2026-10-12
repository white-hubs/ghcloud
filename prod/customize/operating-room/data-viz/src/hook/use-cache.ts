import { storeCache, type RoomItem } from '@/store/cache'
import type { GetDictionaryByItem } from '@ghcloud/cube-dictionary-service'
import type { NorthProdListDetail } from '@ghcloud/cube-iot-center-service'
import type { Correct, CorrectNorm, RuleNormParam, SpecialNorm } from '@ghcloud/cube-operating-room-service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'

interface UseCache {
  updateCache: () => void;
  cacheDeviceListKey: string;
}

/** 业务数据缓存 */
export const useCache = (): UseCache => {
  const cacheDeviceListKey = 'operating-room-list'
  const cacheOperatingRoomRulesKey = 'operating-room-rules'
  const cacheProductListKey = 'operating-product-list'
  const cacheMqttServiceKey = 'operating-mqtt-service'
  const cacheCorrectKey = 'operating-room-correct-config'
  const cacheSpecialKey = 'operating-room-special-config'
  const cacheDeptListKey = 'operating-dept-list'
  const cacheStore = storeCache()

  const updateCache = (): void => {
    try {
      // 部门
      const deptList = window.businessData?.departmentList ?? [] as DeptList[]
      localStorage.setItem(cacheDeptListKey, JSON.stringify(deptList))
      cacheStore.deptList = deptList
    } catch {
      throw new Error('部门缓存失败')
    }

    // 设备列表
    try {
      const roomList = window.businessData?.devicePageData.records ?? [] as RoomItem[]
      localStorage.setItem(cacheDeviceListKey, JSON.stringify(roomList))
      cacheStore.roomList = roomList
    } catch {
      throw new Error('手术室列表缓存失败')
    }

    try {
      // 手术业务规则
      const allRules = window.businessData?.ruleAllData ?? []
      localStorage.setItem(cacheOperatingRoomRulesKey, JSON.stringify(allRules))
      cacheStore.rules = allRules as { deviceIds: string; productId: string; ruleNormList: RuleNormParam[];file: null | { id: string; path: string;type: string; }; }[]
    } catch {
      throw new Error('监测规则缓存失败')
    }

    try {
      // 产品指标列表
      const prodList = window.businessData?.prodListDetailData ?? []
      localStorage.setItem(cacheProductListKey, JSON.stringify(prodList))
      cacheStore.productList = prodList as NorthProdListDetail[]
    } catch {
      throw new Error('产品指标列表缓存失败')
    }

    try {
      // mqtt配置
      const ipcUrl = window.businessData?.EXTEND_CONFIG_MQTT_BROKER ? `ws://${window.businessData?.EXTEND_CONFIG_MQTT_BROKER}/mqtt` : ''
      const mqttService = {
        ipcUrl,
        ipcAccount: window.businessData?.EXTEND_CONFIG_MQTT_USERNAME ?? '',
        ipcPassword: window.businessData?.EXTEND_CONFIG_MQTT_PASSWORD ?? ''
      }
      localStorage.setItem(cacheMqttServiceKey, JSON.stringify(mqttService))
      cacheStore.mqttService = mqttService
    } catch {
      throw new Error('mqtt配置缓存失败')
    }

    try {
      // 三期需求：修正指标（运营端修正指标设置已经过滤了特殊指标） 过滤当前租户
      const correctNormSet: GetDictionaryByItem[] = window.businessData?.correctNormSet ?? []
      const correctNormList = correctNormSet.map(c => c.variable ? JSON.parse(c.variable) : []) as CorrectNorm[]
      const tenant = window.businessData?.authNowEnterprise?.code ?? ''
      const correctList = correctNormList.filter(correct => correct.tenant?.toString() === tenant)
      localStorage.setItem(cacheCorrectKey, JSON.stringify(correctList))
      cacheStore.correctList = correctList as Correct[]
    } catch {
      throw new Error('修正指标缓存失败')
    }

    try {
      // 三期需求：特殊指标 过滤当前租户
      const specialNormSet: GetDictionaryByItem[] = window.businessData?.specialNormSet ?? []
      const specialNormList = specialNormSet.map(c => c.variable ? JSON.parse(c.variable) : []) as CorrectNorm[]
      const tenant = window.businessData?.authNowEnterprise?.code ?? ''
      const specialList = specialNormList.filter(special => special.tenant?.toString() === tenant)
      localStorage.setItem(cacheSpecialKey, JSON.stringify(specialList))
      cacheStore.specialList = specialList as SpecialNorm[]
    } catch {
      throw new Error('特殊指标缓存失败')
    }
  }

  return {
    updateCache,
    cacheDeviceListKey,
  }
}
