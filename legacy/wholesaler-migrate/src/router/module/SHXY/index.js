export const SHXY = [
  {
    path: '/notice-setting-company',
    name: '通知设置',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/TZSZ'),
    meta: {
      title: '通知设置',
    },
  }, {
    path: '/agreement-mould',
    name: '协议模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYMB/index.vue'),
    meta: {
      title: '协议模板',
    },
  },
  {
    path: '/agreement-mould/add',
    name: '新建协议模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYMB/Modal/CreateEdit'),
    meta: {
      title: '新建协议模板',
    },
  },
  {
    path: '/agreement-mould/edit/:id',
    name: '编辑协议模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYMB/Modal/CreateEdit'),
    meta: {
      title: '编辑协议模板',
    },
  },
  {
    path: '/agreement-mould/:id',
    component: () => import('@/views/PFSGL/SHXY/XYMB/Details/index'),
    name: '协议模板详情',
    meta: {
      title: '协议模板详情',
    },
  },  {
    path: '/agreement-sign',
    name: '协议签订',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYQD'),
    meta: {
      title: '协议签订',
    },
  },
  {
    path: '/agreement-sign/add',
    name: '新建协议',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYQD/Modal/CreateEdit'),
    meta: {
      title: '新建协议',
    },
  },
  {
    path: '/agreement-sign/edit/:id',
    name: '编辑协议',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYQD/Modal/CreateEdit'),
    meta: {
      title: '编辑协议',
    },
  },
  {
    path: '/agreement-sign/:id',
    component: () => import('@/views/PFSGL/SHXY/XYQD/Details/EventDetail'),
    name: '协议详情',
    meta: {
      title: '协议详情',
    },
  },
]