export default [
  {
    path: "/gearLeaseManage",
    name: "租赁管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/lease/manage.vue"
      ),
    meta: {
      title: "租赁管理",
      keepAlive: true,
    },
  },
  {
    path: "/gearLeaseLaunch",
    name: "租赁-我发起的",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/lease/launch.vue"
      ),
    meta: {
      title: "租赁-我发起的",
      keepAlive: true,
    },
  },
  {
    path: "/gearLeasePending",
    name: "租赁-待我处理",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/lease/pending.vue"
      ),
    meta: {
      title: "租赁-待我处理",
      keepAlive: true,
    },
  },
  {
    path: "/gearLeaseApproval",
    name: "租赁审批",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/lease/approval.vue"
      ),
    meta: {
      title: "租赁审批",
      keepAlive: true,
    },
  },
  {
    path: "/gearcheckOutManage",
    name: "退租管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/checkOut/manage.vue"
      ),
    meta: {
      title: "退租管理",
      keepAlive: true,
    },
  },
  {
    path: "/gearcheckOutLaunch",
    name: "我发起的",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/checkOut/launch.vue"
      ),
    meta: {
      title: "我发起的",
      keepAlive: true,
    },
  },
  {
    path: "/gearcheckOutPending",
    name: "待我处理",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/checkOut/pending.vue"
      ),
    meta: {
      title: "待我处理",
      keepAlive: true,
    },
  },
  {
    path: "/gearcheckOutApproval",
    name: "退租审批",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/checkOut/approval.vue"
      ),
    meta: {
      title: "退租审批",
      keepAlive: true,
    },
  },
  {
    path: "/gearInfo",
    name: "档位信息",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/manage/info.vue"
      ),
    meta: {
      title: "档位信息",
      keepAlive: true,
    },
  },
  {
    path: "/gearDetail",
    name: "档位信息详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/manage/detail.vue"
      ),
    meta: {
      title: "档位信息详情",
      keepAlive: true,
    },
  },
  {
    path: "/gearEdit",
    name: "编辑档位信息",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/manage/edit.vue"
      ),
    meta: {
      title: "编辑档位信息",
      keepAlive: true,
    },
  },
  {
    path: "/gearType",
    name: "档位类型",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/manage/type.vue"
      ),
    meta: {
      title: "档位类型",
      keepAlive: true,
    },
  },
  {
    path: "/gearFee",
    name: "档位费用",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/config/fee.vue"
      ),
    meta: {
      title: "档位费用",
      keepAlive: true,
    },
  },
  {
    path: "/gearFeeSet",
    name: "档位费用设置",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/config/feeSet.vue"
      ),
    meta: {
      title: "档位费用设置",
      keepAlive: true,
    },
  },
  {
    path: "/gearFeeTemplate",
    name: "费用模板",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/config/feeTemplate.vue"
      ),
    meta: {
      title: "费用模板",
      keepAlive: true,
    },
  },
  {
    path: "/gearFeeTemplateEdit",
    name: "费用模板编辑",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/config/feeTemplateEdit.vue"
      ),
    meta: {
      title: "费用模板编辑",
      keepAlive: true,
    },
  },
  {
    path: "/gearFeeProject",
    name: "收费项目",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/config/feeProject.vue"
      ),
    meta: {
      title: "收费项目",
      keepAlive: true,
    },
  },
  {
    path: "/gearLeaseMode",
    name: "承租方式",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/config/leaseMode.vue"
      ),
    meta: {
      title: "承租方式",
      keepAlive: true,
    },
  },
  {
    path: "/gearLeaseConfig",
    name: "租赁配置",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/config/leaseConfig.vue"
      ),
    meta: {
      title: "租赁配置",
      keepAlive: true,
    },
  },
  {
    path: "/gearLeaseSituation",
    name: "出租情况",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/statistics/leaseSituation.vue"
      ),
    meta: {
      title: "出租情况",
      keepAlive: true,
    },
  },
  {
    path: "/areaLeaseDetail",
    name: "区域出租详情",
    component: () =>
      import(
        /* webpackChunkName: "about" */
        "@/views/gear/statistics/areaLeaseDetail.vue"
      ),
    meta: {
      title: "区域出租详情",
      keepAlive: true,
    },
  },
];
