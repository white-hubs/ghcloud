export default [
  {
    path: "/vehicleManage",
    name: "车辆管理车辆列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/vehicleManage/manage/list.vue"
      ),
    meta: {
      title: "车辆管理车辆列表",
      keepAlive: true,
    },
  },
  {
    path: "/vehicleOperate",
    name: "车辆管理车辆操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/vehicleManage/manage/operate.vue"
      ),
    meta: {
      title: "车辆管理车辆操作",
      keepAlive: true,
    },
  },
  {
    path: "/vehicleDetail",
    name: "车辆管理车辆详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/vehicleManage/manage/detail.vue"
      ),
    meta: {
      title: "车辆管理车辆详情",
      keepAlive: true,
    },
  },
  {
    path: "/openGateReason",
    name: "开闸原因",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/vehicleManage/openGateReason.vue"
      ),
    meta: {
      title: "开闸原因",
      keepAlive: true,
    },
  },
  {
    path: "/defaultProvince",
    name: "默认省份",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/vehicleManage/baseInfo/defaultProvince.vue"
      ),
    meta: {
      title: "默认省份",
      keepAlive: true,
    },
  },
  {
    path: "/carManage",
    name: "车辆管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/vehicleManage/vehicleManage.vue"
      ),
    meta: {
      title: "车辆管理",
      keepAlive: true,
    },
  },
  {
    path: "/carManageDetail",
    name: "车辆管理详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/vehicleManage/vehicleManageDetail.vue"
      ),
    meta: {
      title: "车辆管理详情",
      keepAlive: true,
    },
  },
  {
    path: "/carTypeConfig",
    name: "车型配置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/vehicleManage/carTypeConfig.vue"
      ),
    meta: {
      title: "车型配置",
      keepAlive: true,
    },
  },
];
