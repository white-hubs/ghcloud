
import { getCacheByKey } from '@/hook/use-utils'
import type { DeviceInstancePage, NorthProdListDetail } from '@ghcloud/cube-iot-center-service'
import type { Correct, MqttService, RuleNormParam, SpecialNorm } from '@ghcloud/cube-operating-room-service'
import type { DeptList } from '@ghcloud/cube-ouaa-service'
import type { SecurityDeviceRecord } from '@ghcloud/cube-security-management-service'
import { defineStore } from 'pinia'

type SecurityDeviceType = {
  [K in keyof SecurityDeviceRecord]: SecurityDeviceRecord[K];
}
export type RoomItem = DeviceInstancePage & SecurityDeviceType & {
  departmentId: string;
  departmentName: string;
}
interface Cache {
  roomList: RoomItem[];
  rules: {
    deviceIds: string;
    productId: string;
    ruleNormList: RuleNormParam[];
    file: {
      id: string;
      path: string;
      type: string;
    } | null;
  }[];
  timer: number | null;
  productList: NorthProdListDetail[];
  mqttService: MqttService;
  correctList: Correct[];
  specialList: SpecialNorm[];
  roomSelect: RoomItem | undefined;
  deptList: DeptList[];
  deptSelect: DeptList;
}

export const storeCache = defineStore('storeCache', {
  state: (): Cache => {
    const cacheDeviceListKey = 'operating-room-list'
    const cacheOperatingRoomRulesKey = 'operating-room-rules'
    const cacheProductListKey = 'operating-product-list'
    const cacheMqttServiceKey = 'operating-mqtt-service'
    const cacheCorrectKey = 'operating-correct-config'
    const cacheSpecialKey = 'operating-room-special-config'
    const cacheDeviceSelectKey = 'operating-room-select'
    const cacheDeptListKey = 'operating-dept-list'
    const cacheDeptSelectKey = 'operating-dept-select'
    return {
      roomList: getCacheByKey(cacheDeviceListKey) as Cache['roomList'] || [],
      rules: getCacheByKey(cacheOperatingRoomRulesKey) as Cache['rules'] || [],
      productList: getCacheByKey(cacheProductListKey) as Cache['productList'] || [],
      mqttService: getCacheByKey(cacheMqttServiceKey) as Cache['mqttService'],
      correctList: getCacheByKey(cacheCorrectKey) as Cache['correctList'] || [],
      specialList: getCacheByKey(cacheSpecialKey) as Cache['specialList'] || [],
      roomSelect: getCacheByKey(cacheDeviceSelectKey) as Cache['roomSelect'],
      deptList: getCacheByKey(cacheDeptListKey) as Cache['deptList'] || [],
      deptSelect: getCacheByKey(cacheDeptSelectKey) as Cache['deptSelect'],
      timer: null,
    }
  },
  getters: {
    roomListByDept (state): RoomItem[] {
      let list = []
      if (state.deptSelect) {
        list = state.roomList.filter(r => r.departmentId === state.deptSelect.id)
      } else {
        list = state.roomList
      }
      return list
    }
  },
  actions: {
    clearTimer () {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
  }
})
