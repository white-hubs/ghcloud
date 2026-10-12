/** 固定的路由 */
export const constantRoutes: AuthRoute.Route[] = [
  {
    path: "/index",
    name: "index",
    component: async () => import("@/views/Index/index.vue"),
    meta: {
      title: "表单流程渲染页",
      keepAlive: false,
    },
  },
  {
    path: "/repeat",
    name: "repeat",
    component: async () => import("@/views/Index/repeat.vue"),
    meta: {
      title: "再次发起中转页",
      keepAlive: false,
    },
  },
  {
    path: "/approval/record",
    name: "record",
    component: async () => import("@/views/Approval/record.vue"),
    meta: {
      title: "审批记录",
      keepAlive: false,
    },
  },
  {
    path: "/approval-list",
    name: "approvalList",
    component: async () => import("@/views/Approval/approvalList.vue"),
    meta: {
      title: "审批列表",
      keepAlive: false,
    },
  },
  {
    path: "/approval/config",
    name: "config",
    component: async () => import("@/views/config/index.vue"),
    meta: {
      title: "流程配置",
      keepAlive: false,
    },
  },
];
