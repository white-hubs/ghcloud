export default [
  {
    path: "/contractList",
    name: "合同列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/fee/contractList.vue"
      ),
    meta: {
      title: "合同列表",
      keepAlive: true,
    },
  },
  {
    path: "/contractDetail",
    name: "合同详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/fee/contractDetail.vue"
      ),
    meta: {
      title: "合同详情",
      keepAlive: true,
    },
  },
  {
    path: "/paymentList",
    name: "缴费单",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/fee/paymentList.vue"
      ),
    meta: {
      title: "缴费单",
      keepAlive: true,
    },
  },
  {
    path: "/paymentDetail",
    name: "缴费单详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/fee/paymentDetail.vue"
      ),
    meta: {
      title: "缴费单详情",
      keepAlive: true,
    },
  },
  {
    path: "/refundList",
    name: "退费单",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/fee/refundList.vue"
      ),
    meta: {
      title: "退费单",
      keepAlive: true,
    },
  },
  {
    path: "/refundDetail",
    name: "退费单详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/fee/refundDetail.vue"
      ),
    meta: {
      title: "退费单详情",
      keepAlive: true,
    },
  },
  {
    path: "/contractTemplate",
    name: "合同模板",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/config/contractTemplate.vue"
      ),
    meta: {
      title: "合同模板",
      keepAlive: true,
    },
  },
  {
    path: "/partyA",
    name: "甲方信息",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/config/partyA.vue"
      ),
    meta: {
      title: "甲方信息",
      keepAlive: true,
    },
  },
  {
    path: "/partyDetail",
    name: "甲方信息详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/config/partyDetail.vue"
      ),
    meta: {
      title: "甲方信息详情",
      keepAlive: true,
    },
  },
  {
    path: "/contractType",
    name: "合同类型",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/config/contractType.vue"
      ),
    meta: {
      title: "合同类型",
      keepAlive: true,
    },
  },
  {
    path: "/contractExpire",
    name: "合同到期",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/contract/statistics/contractExpire.vue"
      ),
    meta: {
      title: "合同到期",
      keepAlive: true,
    },
  },
]