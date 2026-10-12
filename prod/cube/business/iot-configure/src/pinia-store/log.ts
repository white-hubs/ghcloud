import type { MessageContent, WSMessage } from '@/utils/socket'
import dayjs from 'dayjs'
import { defineStore } from 'pinia'

type WsType = WSMessage | WebSocket | null

export const storeLog = defineStore('storeLog', {
  state: () => ({
    _wsMsg: null as WsType,
    _logList: new Array<MessageContent>(),
    _expireTime: null as number | null
  }),
  getters: {
    wsMsg: (state) => state._wsMsg,
    logList: (state) => Array.from(new Set(state._logList)),
    expireTime: (state) => state._expireTime
  },
  actions: {
    setWS (wsMsg: WsType) {
      this._wsMsg = wsMsg
    },
    setLogList (data: MessageContent) {
      const nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      this._logList.unshift({ ...data, nowTime })
      if (this._logList.length > 500) {
        this._logList = []
      }
    },
    resetLogList () {
      this._logList = []
    },
    setExpireTime (data: number) {
      this._expireTime = data
    }
  },
  persist: true
})
