export  const SHBA = [
  {
    path: '/staff-record',
    name: '人员备案',
    exact: true,
    component: () => import('@/views/PFSGL/SHBA/staff.vue'),
    meta: {
      title: '人员备案',
    },
  },
  {
    path: '/vehicle-record',
    name: '车辆备案',
    exact: true,
    component: () => import('@/views/PFSGL/SHBA/vehicle'),
    meta: {
      title: '车辆备案',
    },
  },
  {
    path: '/vehicle-record/:id',
    component: () => import('@/views/PFSGL/SHBA/Details/vehicleDetail'),
    name: '车辆备案详情',
    meta: {
      title: '车辆备案详情',
    },
  },
  {
    path: '/device-record',
    name: '设备备案',
    exact: true,
    component: () => import('@/views/PFSGL/SHBA/device'),
    meta: {
      title: '设备备案',
    },
  },
  {
    path: '/device-record/:id',
    component: () => import('@/views/PFSGL/SHBA/Details/deviceDetail'),
    name: '设备备案详情',
    meta: {
      title: '设备备案详情',
    },
  },
];
