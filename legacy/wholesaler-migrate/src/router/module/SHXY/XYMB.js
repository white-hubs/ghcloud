export default [
  {
    path: 'agreement-mould',
    name: '协议模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYMB'),
    meta: {
      title: '协议模板',
    },
  },
  {
    path: 'agreement-mould/add',
    name: '新建协议模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYMB/Modal/CreateEdit'),
    meta: {
      title: '新建协议模板',
    },
  },
  {
    path: 'agreement-mould/edit/:id',
    name: '编辑协议模板',
    exact: true,
    component: () => import('@/views/PFSGL/SHXY/XYMB/Modal/CreateEdit'),
    meta: {
      title: '编辑协议模板',
    },
  },
  {
    path: 'agreement-mould/:id',
    component: () => import('@/views/PFSGL/SHXY/XYMB/Details/index'),
    name: '协议模板详情',
    meta: {
      title: '协议模板详情',
    },
  },
];
