import { defineStore } from 'pinia'
import type { CustomAMap } from '@/plugin/map-plugin'
interface MapStoreState {
  mapInstance: CustomAMap | null;
}
export const useMapStore = defineStore('map-store', {
  state: (): MapStoreState => {
    return {
      mapInstance: null,
    }
  },
  getters: {
    // 获取地图实例
    getMapInstance (): CustomAMap {
      if (!this.mapInstance) {
        throw new Error('mapInstance is null')
      }
      return this.mapInstance as unknown as CustomAMap
    },
  },
  actions: {
    // 设置地图单例
    setMapInstance (mapInstance: CustomAMap) {
      if (!mapInstance) {
        throw new Error('mapInstance is null')
      }
      this.mapInstance = mapInstance
    },
  }
})
