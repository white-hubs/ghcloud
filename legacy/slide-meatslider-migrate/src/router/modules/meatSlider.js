export default [
  {
    path: "/dataPanel",
    name: "数据看板",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/dataPanel/dataPanel.vue"
      ),
    meta: {
      title: "数据看板",
      keepAlive: true,
    },
  },
  {
    path: "/salesRank",
    name: "商家销售排名",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/dataPanel/salesRank.vue"
      ),
    meta: {
      title: "商家销售排名",
      keepAlive: true,
    },
  },
  {
    path: "/whiteNoteOutCdn",
    name: "白条销售情况",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/dataPanel/whiteNoteOutCdn.vue"
      ),
    meta: {
      title: "白条销售情况",
      keepAlive: true,
    },
  },
  {
    path: "/tallyReasult",
    name: "理货完成批次",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/tallyReasult.vue"
      ),
    meta: {
      title: "理货完成批次",
      keepAlive: true,
    },
  },
  {
    path: "/dataSearch",
    name: "数据查询",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/porkReport/DataSearch.vue"
      ),
    meta: {
      title: "数据查询",
      keepAlive: true,
    },
  },
  {
    path: "/dataAudit",
    name: "数据审核",
    component: () => import("@/views/meatSlider/porkReport/DataAudit.vue"),
    meta: {
      title: "数据审核",
      keepAlive: true,
    },
  },
  {
    path: "/dataManage",
    name: "报备管理",
    component: () => import("@/views/meatSlider/porkReport/dataManage.vue"),
    meta: {
      title: "报备管理",
      keepAlive: true,
    },
  },
  {
    path: "/auditData",
    name: "审核数据",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/porkReport/auditData.vue"
      ),
    meta: {
      title: "审核数据",
      keepAlive: true,
    },
  },
  {
    path: "/addAuditData",
    name: "新增审核",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/porkReport/addAuditData.vue"
      ),
    meta: {
      title: "新增审核",
      keepAlive: true,
    },
  },
  {
    path: "/addNewAuditData",
    name: "新增来货报备",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/porkReport/addNewAuditData.vue"
      ),
    meta: {
      title: "新增来货报备",
      keepAlive: true,
    },
  },
  {
    path: "/tallyDataSearch",
    name: "理货数据查询",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/tallyData/tallyDataSearch.vue"
      ),
    meta: {
      title: "理货数据查询",
      keepAlive: true,
    },
  },
  {
    path: "/tallyDataSync",
    name: "理货数据同步",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/tallyData/tallyDataSync.vue"
      ),
    meta: {
      title: "理货数据同步",
      keepAlive: true,
    },
  },
  {
    path: "/tallyDataDetails",
    name: "理货数据详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/tallyData/tallyDataDetails.vue"
      ),
    meta: {
      title: "理货数据查询",
      keepAlive: true,
    },
  },
  {
    path: "/tallyDataAudit",
    name: "理货数据审核",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/tallyData/tallyDataAudit.vue"
      ),
    meta: {
      title: "理货数据审核",
      keepAlive: true,
    },
  },

  {
    path: "/testResultSearch",
    name: "抽检结果查询",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/testResult/testResultSearch.vue"
      ),
    meta: {
      title: "抽检结果查询",
      keepAlive: true,
    },
  },
  {
    path: "/testResultReport",
    name: "抽检结果上报",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/testResult/testResultReport.vue"
      ),
    meta: {
      title: "抽检结果上报",
      keepAlive: true,
    },
  },
  {
    path: "/testResult",
    name: "抽检结果",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/testResult/testResult.vue"
      ),
    meta: {
      title: "抽检结果",
      keepAlive: true,
    },
  },

  {
    path: "/quarantineSearch",
    name: "检疫票查询",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/quarantine/quarantineSearch.vue"
      ),
    meta: {
      title: "检疫票查询",
      keepAlive: true,
    },
  },
  {
    path: "/quarantineOrder",
    name: "检疫票登记",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/quarantine/quarantineOrder.vue"
      ),
    meta: {
      title: "检疫票登记",
      keepAlive: true,
    },
  },
  {
    path: "/quarantineRegister",
    name: "登记检疫票",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/quarantine/quarantineRegister.vue"
      ),
    meta: {
      title: "登记检疫票",
      keepAlive: true,
    },
  },

  {
    path: "/goodsTraceability",
    name: "食安溯源",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/goodsTraceability/goodsTraceability.vue"
      ),
    meta: {
      title: "食安溯源",
      keepAlive: true,
    },
  },
  {
    path: "/goodsTraceabilityDetails",
    name: "溯源详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/goodsTraceability/goodsTraceabilityDetails.vue"
      ),
    meta: {
      title: "溯源详情",
      keepAlive: true,
    },
  },
  {
    path: "/orderManage",
    name: "订单管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/order/orderManage.vue"
      ),
    meta: {
      title: "订单管理",
      keepAlive: true,
    },
  },
  {
    path: "/productFollowUp",
    name: "供货商品跟进",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/followUp/productFollowUp.vue"
      ),
    meta: {
      title: "供货商品跟进",
      keepAlive: true,
    },
  },
  {
    path: "/followUpDetails",
    name: "供货商品跟进详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/followUp/followUpDetails.vue"
      ),
    meta: {
      title: "供货商品跟进详情",
      keepAlive: true,
    },
  },
  {
    path: "/orderDetails",
    name: "滑轨订单详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/order/orderDetails.vue"
      ),
    meta: {
      title: "滑轨订单详情",
      keepAlive: true,
    },
  },
  {
    path: "/settlementBill",
    name: "结算账单",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/settleBill/settlementBill.vue"
      ),
    meta: {
      title: "结算账单",
      keepAlive: true,
    },
  },
  {
    path: "/settlementConfig",
    name: "结算配置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/settleBill/settlementConfig.vue"
      ),
    meta: {
      title: "结算配置",
      keepAlive: true,
    },
  },

  {
    path: "/salesStatistics",
    name: "销售统计",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/salesStatistics/salesStatistics.vue"
      ),
    meta: {
      title: "销售统计",
      keepAlive: true,
    },
  },
  {
    path: "/slaughterhouseReport",
    name: "屠宰场报表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/salesStatistics/slaughterhouseReport.vue"
      ),
    meta: {
      title: "屠宰场报表",
      keepAlive: true,
    },
  },

  {
    path: "/slaughterhouse",
    name: "屠宰场",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/slaughterhouse.vue"
      ),
    meta: {
      title: "屠宰场",
      keepAlive: true,
    },
  },
  {
    path: "/slaughterhouseOperate",
    name: "屠宰场操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/slaughterhouseOperate.vue"
      ),
    meta: {
      title: "屠宰场操作",
      keepAlive: true,
    },
  },
  {
    path: "/inspectorManage",
    name: "抽检员",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/inspectorManage.vue"
      ),
    meta: {
      title: "抽检员",
      keepAlive: true,
    },
  },
  {
    path: "/inspectorOperate",
    name: "抽检员管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/inspectorOperate.vue"
      ),
    meta: {
      title: "抽检员管理",
      keepAlive: true,
    },
  },
  {
    path: "/inspectorProportion",
    name: "抽检比例",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/inspectorProportion.vue"
      ),
    meta: {
      title: "抽检比例",
      keepAlive: true,
    },
  },
  {
    path: "/whiteNoteWeight",
    name: "白条重量设置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/whiteNoteWeight.vue"
      ),
    meta: {
      title: "白条重量设置",
      keepAlive: true,
    },
  },
  {
    path: "/weightLoss",
    name: "重量损耗",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/weightLoss.vue"
      ),
    meta: {
      title: "重量损耗",
      keepAlive: true,
    },
  },
  {
    path: "/weightOperate",
    name: "重量损耗操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/weightOperate.vue"
      ),
    meta: {
      title: "重量损耗操作",
      keepAlive: true,
    },
  },

  {
    path: "/salePrice",
    name: "最低价格设置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/salePrice.vue"
      ),
    meta: {
      title: "最低价格设置",
      keepAlive: true,
    },
  },
  {
    path: "/angleMarkScan",
    name: "理货码设置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/angleMarkScan.vue"
      ),
    meta: {
      title: "理货码设置",
      keepAlive: true,
    },
  },
  {
    path: "/panelVisibility",
    name: "看板可见性",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/baseSettle/panelVisibility.vue"
      ),
    meta: {
      title: "panelVisibility",
      keepAlive: true,
    },
  },

  {
    path: "/reportAuditMsg",
    name: "报备审核通知",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/msgNotice/reportAuditMsg.vue"
      ),
    meta: {
      title: "报备审核通知",
      keepAlive: true,
    },
  },
  {
    path: "/tallyAuditMsg",
    name: "理货审核通知",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/msgNotice/tallyAuditMsg.vue"
      ),
    meta: {
      title: "理货审核通知",
      keepAlive: true,
    },
  },
  {
    path: "/orderMsg",
    name: "订单通知",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/msgNotice/orderMsg.vue"
      ),
    meta: {
      title: "订单通知",
      keepAlive: true,
    },
  },
  {
    path: "/passwordEditMsg",
    name: "密码通知",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/msgNotice/passwordEditMsg.vue"
      ),
    meta: {
      title: "密码通知",
      keepAlive: true,
    },
  },
  {
    path: "/bizLog",
    name: "业务日志记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/bizLog.vue"
      ),
    meta: {
      title: "业务日志记录",
      keepAlive: true,
    },
  },
  {
    path: "/loginLog",
    name: "登录日志记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/meatSlider/loginLog.vue"
      ),
    meta: {
      title: "登录日志记录",
      keepAlive: true,
    },
  },
];
