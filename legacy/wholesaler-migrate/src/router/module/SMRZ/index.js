export const SMRZ = [
  {
    path: '/real-name-auth',
    name: '实名认证',
    exact: true,
    component: () => import('@/views/PFSGL/SMRZ/SMRZ/index'),
    meta: {
      title: '通知设置',
    },
  },
  {
    path: '/real-name-auth/detail/:id',
    name: '实名认证详情',
    exact: true,
    component: () => import('@/views/PFSGL/SMRZ/SMRZ/Details/index'),
    meta: {
      title: '实名认证详情',
    },
  }, {
    path: '/notice-setting-auth',
    name: '通知设置',
    exact: true,
    component: () => import('@/views/PFSGL/SMRZ/notice-setting'),
    meta: {
      title: '通知设置',
    },
  },
];
