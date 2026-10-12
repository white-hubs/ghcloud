import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'playback-record',
    path: '/playback-record',
    component: async () => (await import('@/views/playback-record')).PlaybackRecord,
    meta: {
      title: '播放记录'
    }
  },
  {
    name: 'show-store',
    path: '/show-store',
    component: async () => (await import('@/views/show-store')).ShowStore,
    meta: {
      title: '节目库'
    }
  },
  {
    name: 'send-show-list',
    path: '/send-show-list',
    component: async () => (await import('@/views/send-show-list')).SendShowList,
    meta: {
      title: '发送节目'
    }
  },
  {
    name: 'send-show-edit',
    path: '/send-show-edit',
    component: async () => (await import('@/views/send-show-list/edit-send-show')).EditSendShow,
    meta: {
      title: '发送节目'
    }
  },
  {
    name: 'terminal-show-list',
    path: '/terminal-show-list',
    component: async () => (await import('@/views/terminal-show-list')).TerminalShowList,
    meta: {
      title: '终端节目列表'
    }
  },
  {
    name: 'definite-time-switch',
    path: '/definite-time-switch',
    component: async () => (await import('@/views/definite-time-switch')).DefineTimeSwitch,
    meta: {
      title: '定时开关'
    }
  },
  {
    name: 'definite-time-switch-edit',
    path: '/define-time-switch-edit',
    component: async () => (await import('@/views/definite-time-switch/edit-switch')).EditSwitch,
  }
]
