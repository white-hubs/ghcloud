export default [
  {
    path: 'agreement-sign',
    name: '协议签订',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYQD'),
    meta: {
      title: '协议签订',
    },
  },
  {
    path: 'agreement-sign/add',
    name: '新建协议',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYQD/Modal/CreateEdit'),
    meta: {
      title: '新建协议',
    },
  },
  {
    path: 'agreement-sign/edit/:id',
    name: '编辑协议',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYQD/Modal/CreateEdit'),
    meta: {
      title: '编辑协议',
    },
  },
  {
    path: 'agreement-sign/:id',
    component: () => import('@/views/PFSGL/SHXY/XYQD/Details/EventDetail'),
    name: '协议详情',
    meta: {
      title: '协议详情',
    },
  },
];
