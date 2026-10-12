export const resourceManage = [
  {
    path: '/stuff-search',
    name: 'stuff-search',
    component: async (): Promise<unknown> => (await import('@/views/resource-manage/stuff-search')).StuffSearch,
    mete: {
      title: '物品查询'
    }
  },
  {
    path: '/stuff-manage',
    name: 'stuff-manage',
    component: async (): Promise<unknown> => (await import('@/views/resource-manage/stuff-manage')).StuffManage,
    mete: {
      title: '物品管理'
    }
  },
  {
    path: '/machine-manage',
    name: 'machine-manage',
    component: async (): Promise<unknown> => (await import('@/views/resource-manage/machine-manage')).MachineManage,
    mete: {
      title: '机组管理'
    }
  },
  {
    path: '/relate-operating-room',
    name: 'relate-operating-room',
    component: async (): Promise<unknown> => (await import('@/views/resource-manage/machine-manage/relate-operating-room')).RelateOperatingRoom,
    mete: {
      title: '关联手术室'
    }
  },
]
