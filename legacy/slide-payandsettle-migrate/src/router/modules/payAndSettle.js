export default [
  {
    path: "/businessAccount",
    name: "商家账户",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/account/businessAccount.vue"
      ),
    meta: {
      title: "商家账户",
      keepAlive: true,
    },
  },
  {
    path: "/businessAccountDetail",
    name: "账户详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/account/businessAccountDetail.vue"
      ),
    meta: {
      title: "账户详情",
      keepAlive: true,
    },
  },
  {
    path: "/marketAccount",
    name: "交易流水",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/account/marketAccount.vue"
      ),
    meta: {
      title: "交易流水",
      keepAlive: true,
    },
  },
  {
    path: "/accountReceipt",
    name: "收款单",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/account/receipt.vue"
      ),
    meta: {
      title: "收款单",
      keepAlive: true,
    },
  },
  {
    path: "/accountReceiptRecord",
    name: "收款记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/account/record.vue"
      ),
    meta: {
      title: "收款记录",
      keepAlive: true,
    },
  },
  {
    path: "/marketAll",
    name: "市场总账",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/account/marketAll.vue"
      ),
    meta: {
      title: "市场总账",
      keepAlive: true,
    },
  },
  {
    path: "/bindCard",
    name: "绑定IC卡",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/card/bindCard.vue"
      ),
    meta: {
      title: "绑定IC卡",
      keepAlive: true,
    },
  },
  {
    path: "/bindBank",
    name: "绑定银行卡",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/card/bindBank.vue"
      ),
    meta: {
      title: "绑定银行卡",
      keepAlive: true,
    },
  },
  {
    path: "/bankCard",
    name: "银行卡",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/card/bankCard.vue"
      ),
    meta: {
      title: "银行卡",
      keepAlive: true,
    },
  },
  {
    path: "/memberCard",
    name: "会员卡",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/card/memberCard.vue"
      ),
    meta: {
      title: "会员卡",
      keepAlive: true,
    },
  },
  // {
  //   path: "/digitalRMB",
  //   name: "数字人名币",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "about" */ "@/views/payAndSettle/pay/digitalRMB.vue"
  //     ),
  //   meta: {
  //     title: "数字人名币",
  //     keepAlive: true,
  //   },
  // },
  {
    path: "/walletPay",
    name: "钱包支付",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/pay/walletPay.vue"
      ),
    meta: {
      title: "钱包支付",
      keepAlive: true,
    },
  },
  {
    path: "/wechatPay",
    name: "微信支付",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/pay/wechatPay.vue"
      ),
    meta: {
      title: "微信支付",
      keepAlive: true,
    },
  },
  {
    path: "/bankcardPay",
    name: "银行卡验证",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/pay/bankcardPay.vue"
      ),
    meta: {
      title: "银行卡验证",
      keepAlive: true,
    },
  },
  {
    path: "/recharge",
    name: "商家充值",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/recharge/recharge.vue"
      ),
    meta: {
      title: "商家充值",
      keepAlive: true,
    },
  },
  {
    path: "/rechargeRecord",
    name: "充值记录",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/recharge/rechargeRecord.vue"
      ),
    meta: {
      title: "充值记录",
      keepAlive: true,
    },
  },
  {
    path: "/approve",
    name: "提现审批",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/recharge/approve.vue"
      ),
    meta: {
      title: "提现审批",
      keepAlive: true,
    },
  },
  {
    path: "/approveDetail",
    name: "审批详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/recharge/approveDetail.vue"
      ),
    meta: {
      title: "审批详情",
      keepAlive: true,
    },
  },
  {
    path: "/msgNotice",
    name: "支付消息通知",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/payAndSettle/msgSet/msgNotice.vue"
      ),
    meta: {
      title: "支付消息通知",
      keepAlive: true,
    },
  },
]