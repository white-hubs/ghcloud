import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/planApproval/list",
    component: () => import("@/views/workflow/approval/ApprovalList.vue"),
    name: "预案审核",
    meta: { title: "预案审核", keepAlive: true },
  },
  {
    path: "/planApproval/detail",
    component: () => import("@/views/workflow/approval/ApprovalDetail.vue"),
    name: "审核详情",
    meta: { title: "审核详情" },
  },
  {
    path: "/planApproval/config",
    component: () => import("@/views/workflow/approval/ApprovalConfig.vue"),
    name: "审核配置",
    meta: { title: "审核配置", keepAlive: true },
  },
  {
    path: "/planEvent/list",
    component: () => import("@/views/workflow/event/EventList.vue"),
    name: "事件管理",
    meta: { title: "事件管理", keepAlive: true },
  },
  {
    path: "/planEvent/launch",
    component: () => import("@/views/workflow/event/EventLaunch.vue"),
    name: "启动预案",
    meta: { title: "启动预案" },
  },
  {
    path: "/planEvent/detail",
    component: () => import("@/views/workflow/event/EventDetail.vue"),
    name: "事件详情",
    meta: { title: "事件详情" },
  },
  {
    path: "/planReview/list",
    component: () => import("@/views/workflow/review/ReviewList.vue"),
    name: "复盘优化",
    meta: { title: "复盘优化", keepAlive: true },
  },
  {
    path: "/planReview/report",
    component: () => import("@/views/workflow/review/ReviewReport.vue"),
    name: "复盘报告",
    meta: { title: "复盘报告" },
  },
  {
    path: "/planRevision/todo",
    component: () => import("@/views/workflow/revision/RevisionTodo.vue"),
    name: "修订待办",
    meta: { title: "修订待办", keepAlive: true },
  },
  {
    path: "/planDocument/list",
    component: () => import("@/views/planDocuments/list.vue"),
    name: "预案文件",
    meta: {
      title: "预案文件",
      keepAlive: true,
    },
  },
  {
    path: "/planDocument/detail",
    component: () => import("@/views/planDocuments/detail.vue"),
    name: "预案文件详情",
    meta: {
      title: "预案文件详情",
      keepAlive: true,
    },
  },
  {
    path: "/planGenerate",
    component: () => import("@/views/planGenerate/index.vue"),
    name: "预案生成",
    meta: {
      title: "预案生成",
      keepAlive: true,
    },
  },
  {
    path: "/planRules/list",
    component: () => import("@/views/planRules/list.vue"),
    name: "预案规则",
    meta: {
      title: "预案规则",
      keepAlive: true,
    },
  },
  {
    path: "/messageNotice",
    name: "messageNotice",
    component: () => import("@/views/messageNotice/newMessageNotice.vue"),
    meta: {
      title: "报警通知",
      keepAlive: true,
    },
  },
  {
    path: "/eventlist",
    name: "eventlist",
    component: () => import("@/views/eventType/index.vue"),
    meta: {
      title: "事件分类",
      keepAlive: true,
    },
  },
  {
    path: "/file",
    name: "fileList",
    component: () => import("@/views/file-type/file-type.vue"),
    meta: {
      title: "文件分类",
    },
  },
  {
    path: "/taskTemplate",
    name: "taskTemplate",
    component: () => import("@/views/taskTemplate/index.vue"),
    meta: {
      title: "任务模板配置",
      keepAlive: true,
    },
  },
];
