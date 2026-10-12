export default [
  {
    path: 'contract-list',
    name: '合同列表',
    exact: true,
    component: () => import('@/views/PFSGL/HTGL/HTLB/index'),
    meta: {
      title: '合同列表',
    },
  },
  {
    path: 'contract-list/add',
    name: '添加合同',
    exact: true,
    component: () => import('@/views/PFSGL/HTGL/HTLB/Modal/CreateEdit'),
    meta: {
      title: '添加合同',
    },
  },
  {
    path: 'contract-list/edit/:id',
    name: '编辑合同',
    exact: true,
    component: () => import('@/views/PFSGL/HTGL/HTLB/Modal/CreateEdit'),
    meta: {
      title: '编辑合同',
    },
  },
  {
    path: 'contract-list/detail/:id',
    name: '合同详情',
    exact: true,
    component: () => import('@/views/PFSGL/HTGL/HTLB/Details'),
    meta: {
      title: '合同详情',
    },
  },
];
