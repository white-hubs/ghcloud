import { ConfigLoader } from '@/pages/config-loader'
import { defineStore } from 'pinia'

export const storeHead = defineStore('useStoreHead', {
  state: () =>{
    return {
      timeSelected: {
        label: '自动',
        value: 'auto',
        img: 'time1.png',
      },
      weatherSelected: {
        label: '晴',
        value: 'Sunny',
        weatherCode: ['00'],
        img: 'tianqi/00.png'
      },
      perspectiveSelected: ConfigLoader.config.modelPerspective.length ? ConfigLoader.config.modelPerspective[0] : { label: '默认', value: 'default' },
      qualitySelected: { value: 'medium', label: '中' },
      // 漫游相关数据
      roamingDevicesArr: [],
      isRoaming: true,
      cameraViewSuccess: 0,
      roamShow: true
    }
  },
  getters: {

  },
  actions: {

  }
})