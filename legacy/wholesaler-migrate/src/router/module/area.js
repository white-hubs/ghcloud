export  const AREA =  [
  {
    path: '/area-manage',
    exact: true,
    name: '区域管理',
    component: () => import('@/views/PFSGL/Area'),
  },
  {
    path: '/area/add',
    exact: true,
    name: '新增区域',
    component: () => import('@/views/PFSGL/AreaSpace/Area/create-edit'),
  },
  {
    path: '/area/edit/:id',
    exact: true,
    name: '修改区域',
    component: () => import('@/views/PFSGL/AreaSpace/Area/create-edit'),
  },
  {
    path: '/area/cameraStatus/:id',
    exact: true,
    name: '绑定视角',
    component: () => import('@/views/PFSGL/Area/CameraStatus'),
    meta: {
      title: '绑定视角',
    },
  },
  {
    path: '/space/add',
    exact: true,
    name: '新增空间',
    component: () => import('@/views/PFSGL/AreaSpace/Space/create-edit'),
  },
  {
    path: '/space/:id/edit',
    exact: true,
    name: '编辑空间',
    component: () => import('@/views/PFSGL/AreaSpace/Space/create-edit'),
  },
];
