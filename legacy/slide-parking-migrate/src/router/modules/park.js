export default [
  // 车辆管理
  {
    path: "/parkVehList",
    name: "停车车辆列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/vehicleManage/manage/list.vue"
      ),
    meta: {
      title: "停车车辆列表",
      keepAlive: true,
    },
  },
  {
    path: "/parkVehOperate",
    name: "停车车辆操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/vehicleManage/manage/operate.vue"
      ),
    meta: {
      title: "停车车辆操作",
      keepAlive: true,
    },
  },
  {
    path: "/parkVehDetail",
    name: "停车车辆详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/vehicleManage/manage/details.vue"
      ),
    meta: {
      title: "停车车辆详情",
      keepAlive: true,
    },
  },
  {
    path: "/whiteList",
    name: "车辆白名单",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/vehicleManage/whiteList.vue"
      ),
    meta: {
      title: "车辆白名单",
      keepAlive: true,
    },
  },
  {
    path: "/blacklist",
    name: "车辆黑名单",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/vehicleManage/blacklist.vue"
      ),
    meta: {
      title: "车辆黑名单",
      keepAlive: true,
    },
  },
  // 车场管理
  {
    path: "/parkingMonitor",
    name: "车场监控",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/parkingLot/monitor.vue"
      ),
    meta: {
      title: "车场监控",
      keepAlive: true,
    },
  },
  {
    path: "/vehicleLane",
    name: "车道管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/parkingLot/vehicleLane.vue"
      ),
    meta: {
      title: "车道管理",
      keepAlive: true,
    },
  },
  // 收费管理
  {
    path: "/chargeRule",
    name: "收费规则",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/charge/rules.vue"
      ),
    meta: {
      title: "收费规则",
      keepAlive: true,
    },
  },
  // 基础信息
  {
    path: "/vehicleCard",
    name: "车卡管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/baseInfo/vehicleCard.vue"
      ),
    meta: {
      title: "车卡管理",
      keepAlive: true,
    },
  },
  {
    path: "/broadcast",
    name: "播报信息",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/baseInfo/broadcast.vue"
      ),
    meta: {
      title: "播报信息",
      keepAlive: true,
    },
  },
  // 车场明细
  {
    path: "/turnover",
    name: "进出流水记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/turnover.vue"
      ),
    meta: {
      title: "进出流水记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterCorrect",
    name: "入场修正记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/enterCorrect.vue"
      ),
    meta: {
      title: "入场修正记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterRepair",
    name: "入场补录记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/enterRepair.vue"
      ),
    meta: {
      title: "入场补录记录",
      keepAlive: true,
    },
  },
  {
    path: "/chargeReconcile",
    name: "收费对账",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/chargeReconcile/list.vue"
      ),
    meta: {
      title: "收费对账",
      keepAlive: true,
    },
  },
  {
    path: "/reconcile",
    name: "对账明细",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/chargeReconcile/reconcile.vue"
      ),
    meta: {
      title: "对账明细",
      keepAlive: true,
    },
  },
  {
    path: "/reconcileRecord",
    name: "对账记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/reconcileRecord.vue"
      ),
    meta: {
      title: "对账记录",
      keepAlive: true,
    },
  },
  {
    path: "/payRecord",
    name: "缴费记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/payRecord.vue"
      ),
    meta: {
      title: "缴费记录",
      keepAlive: true,
    },
  },
  {
    path: "/manualOpenRecord",
    name: "手动开闸记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/yardDetails/manualOpenRecord.vue"
      ),
    meta: {
      title: "手动开闸记录",
      keepAlive: true,
    },
  },
  // 停车收费统计
  {
    path: "/parkRechargeRecord",
    name: "停车收费统计",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/parkManage/statisReport/parkRechargeRecord.vue"
      ),
    meta: {
      title: "停车收费统计",
      keepAlive: true,
    },
  },
];
