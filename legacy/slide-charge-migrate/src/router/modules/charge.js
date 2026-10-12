export default [
  {
    path: "/approachReport",
    name: "报备管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/approachReport/reportManege.vue"
      ),
    meta: {
      title: "报备管理",
      keepAlive: true,
    },
  },
  {
    path: "/enterPanel",
    name: "进场数据看板",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDataPanel/enterDataPanel.vue"
      ),
    meta: {
      title: "进场数据看板",
      keepAlive: true,
    },
  },
  {
    path: "/approachReportDetail",
    name: "报备管理详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/approachReport/reportDetail.vue"
      ),
    meta: {
      title: "报备管理详情",
      keepAlive: true,
    },
  },
  {
    path: "/carManage",
    name: "车辆管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/vehicleManage/vehicleManage.vue"
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
        /* webpackChunkName: "about" */ "@/views/approach/vehicleManage/vehicleManageDetail.vue"
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
        /* webpackChunkName: "about" */ "@/views/approach/baseSet/carTypeConfig.vue"
      ),
    meta: {
      title: "车型配置",
      keepAlive: true,
    },
  },
  {
    path: "/ruleGroup",
    name: "规则分组",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/baseSet/ruleGroup.vue"
      ),
    meta: {
      title: "规则分组",
      keepAlive: true,
    },
  },
  {
    path: "/invalidTime",
    name: "报备失效时间",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/baseSet/invalidTime.vue"
      ),
    meta: {
      title: "报备失效时间",
      keepAlive: true,
    },
  },
  {
    path: "/feeDetail",
    name: "收费明细",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/baseSet/feeDetail.vue"
      ),
    meta: {
      title: "收费明细",
      keepAlive: true,
    },
  },
  {
    path: "/enterMsgNotice",
    name: "进场收费消息",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/baseSet/enterMsgNotice.vue"
      ),
    meta: {
      title: "进场收费消息",
      keepAlive: true,
    },
  },
  {
    path: "/feeDetailOperate",
    name: "收费规则操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/baseSet/feeDetailOperate.vue"
      ),
    meta: {
      title: "收费规则操作",
      keepAlive: true,
    },
  },
  {
    path: "/approachStatistic",
    name: "进场统计",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/statistic/approachStatistic.vue"
      ),
    meta: {
      title: "进场统计",
      keepAlive: true,
    },
  },
  // 进场明细
  {
    path: "/enterChargeRecord",
    name: "进场收费记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/chargeRecord.vue"
      ),
    meta: {
      title: "进场收费记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterCheckoutRecord",
    name: "进场结账记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/checkoutRecord.vue"
      ),
    meta: {
      title: "进场结账记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterCheckoutRecordDetail",
    name: "进场结账记录明细",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/checkoutRecordDetail.vue"
      ),
    meta: {
      title: "进场结账记录明细",
      keepAlive: true,
    },
  },
  {
    path: "/enterChargeReconcilie",
    name: "进场收费对账",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/chargeReconcilie.vue"
      ),
    meta: {
      title: "进场收费对账",
      keepAlive: true,
    },
  },
  {
    path: "/enterChargeReconDetail",
    name: "进场收费对账详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/chargeReconDetail.vue"
      ),
    meta: {
      title: "进场收费对账详情",
      keepAlive: true,
    },
  },
  {
    path: "/enterReconRecord",
    name: "进场对账记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/reconRecord.vue"
      ),
    meta: {
      title: "进场对账记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterEnterRecord",
    name: "进场进场记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/enterRecord.vue"
      ),
    meta: {
      title: "进场进场记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterFeeEditRecord",
    name: "进场金额修改记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/feeEditRecord.vue"
      ),
    meta: {
      title: "进场金额修改记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterWeightEditRecord",
    name: "进场重量更改记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/weightEditRecord.vue"
      ),
    meta: {
      title: "进场重量更改记录",
      keepAlive: true,
    },
  },
  {
    path: "/enterManualOpenRecord",
    name: "进场手动开闸记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/approach/enterDetails/manualOpenRecord.vue"
      ),
    meta: {
      title: "进场手动开闸记录",
      keepAlive: true,
    },
  },
];
