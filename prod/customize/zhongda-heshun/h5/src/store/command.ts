import { defineStore } from 'pinia'

// 定义命令数据接口
interface CommandState {
  // 设备信息
  commandName: string;
  deviceId: string;
  propWriteValueList: {
    code: string;
    name: string;
    expectedValue: string;
    expectedName?: string;
  }[];
  name: string;
  actionName: string;
  state: string;
  // 时间信息
  loopHour: string;
  loopType: string;
  timer: string;
  loopDay: number[];
}

/**
 * 命令数据管理store
 */
export const useCommandStore = defineStore('commandStore', {
  state: (): CommandState => ({
    // 设备信息
    state: '',
    commandName: '',
    deviceId: '',
    propWriteValueList: [],
    name: '',

    // 时间信息
    loopHour: '',
    loopType: 'EVERY_WEEK',
    timer: '',
    actionName: '',
    loopDay: []
  }),

  actions: {
    /**
     * 保存设备选择数据
     */
    saveDeviceData (data: {
      commandName: string;
      deviceId: string;
      propWriteValueList: {
        code: string;
        name: string;
        expectedValue: string;
      }[];
      name: string;
    }): void {
      this.commandName = data.commandName
      this.deviceId = data.deviceId
      this.propWriteValueList = data.propWriteValueList
      this.actionName = data.name
    },

    /**
     * 保存时间选择数据
     */
    saveTimeData (data: {
      loopHour: string;
      loopType: string;
      timer: string;
      loopDay: number[];
    }): void {
      this.loopHour = data.loopHour
      this.loopType = data.loopType
      this.timer = data.timer
      this.loopDay = data.loopDay
    },

    saveName (
      data: {
        name: string;
      }
    ): void{
      this.name = data.name
    },
    saveState (
      data: {
        state: string;
      }
    ): void{
      this.state = data.state
    },
    /**
     * 重置store数据
     */
    resetStore (): void {
      this.commandName = ''
      this.deviceId = ''
      this.propWriteValueList = []
      this.name = ''
      this.loopHour = ''
      this.actionName = ''
      this.loopType = 'EVERY_WEEK'
      this.timer = ''
      this.loopDay = []
    }
  },

  // 持久化配置
  persist: true
})