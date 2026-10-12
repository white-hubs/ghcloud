export default [
  {
    path: "/authentication",
    name: "商户认证",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/businessManage/authentication.vue"
      ),
    meta: {
      title: "商户认证",
      keepAlive: true,
    },
  },

  {
    path: "/moreAuthenDetails",
    name: "商户认证信息",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/businessManage/moreAuthenDetails.vue"
      ),
    meta: {
      title: "商户认证信息",
      keepAlive: true,
    },
  },
  {
    path: "/riskManage",
    name: "商户风险管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/businessManage/riskManage.vue"
      ),
    meta: {
      title: "商户风险管理",
      keepAlive: true,
    },
  },
  {
    path: "/satMsgConfig",
    name: "通知设置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/realNameAuth/satMsgConfig.vue"
      ),
    meta: {
      title: "通知设置",
      keepAlive: true,
    },
  },
  {
    path: "/authAudit",
    name: "批发商实名认证",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/realNameAuth/authAudit.vue"
      ),
    meta: {
      title: "批发商实名认证",
      keepAlive: true,
    },
  },
  {
    path: "/purchaserAuthAudit",
    name: "采购商实名认证",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/realNameAuth/purchaserAuthAudit.vue"
      ),
    meta: {
      title: "采购商实名认证",
      keepAlive: true,
    },
  },
  {
    path: "/authAuditOperate",
    name: "实名认证操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/realNameAuth/authAuditOperate.vue"
      ),
    meta: {
      title: "实名认证操作",
      keepAlive: true,
    },
  },
  // 采购商实名认证操作
  { 
    path:"/purchaserAuthAuditOperate",
    name:"采购商认证操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/realNameAuth/purchaserAuthAuditOperate.vue"
      ),
    meta: {
      title: "采购商认证操作",
      keepAlive: true,
    },
  },
  {
    path: "/wholeSalerInfo",
    name: "批发商资料",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/wholeSaler/wholeSalerInfo.vue"
      ),
    meta: {
      title: "批发商资料",
      keepAlive: true,
    },
  },
  {
    path: "/wholeSalerInfoOperate",
    name: "批发商资料操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/wholeSaler/wholeSalerInfoOperate.vue"
      ),
    meta: {
      title: "批发商资料操作",
      keepAlive: true,
    },
  },
  {
    path: "/purchaserInfo",
    name: "采购商资料",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/purchaser/purchaserInfo.vue"
      ),
    meta: {
      title: "采购商资料",
      keepAlive: true,
    },
  },
  {
    path: "/purchaserInfoOperate",
    name: "采购商资料操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/business/purchaser/purchaserInfoOperate.vue"
      ),
    meta: {
      title: "采购商资料操作",
      keepAlive: true,
    },
  },
]