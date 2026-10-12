export default [
  {
    path: '/parkingMonitoring',
    component: () => import("@/views/pages/parkingMonitoring.vue"),
    name: "停车监控",
    meta: {
      title: "停车监控",
      keepAlive: true,
    },
  },
  {
    path: '/accessRecords',
    component: () => import("@/views/pages/accessRecords.vue"),
    name: "出入记录",
    meta: {
      title: "出入记录",
      keepAlive: true,
    },
  },
  {
    path: '/strandedVehicles',
    component: () => import("@/views/pages/strandedVehicles.vue"),
    name: "滞留车辆",
    meta: {
      title: "滞留车辆",
      keepAlive: true,
    },
  },
  {
    path: '/charges',
    component: () => import("@/views/pages/charges.vue"),
    name: "收费记录",
    meta: {
      title: "收费记录",
      keepAlive: true,
    },
  },
]