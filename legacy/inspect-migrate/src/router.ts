import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/inspectionPlan',
    component: () => import("@/views/inspection/plan/list.vue"),
    name: "巡检计划",
    meta: {
      title: "巡检计划",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionPlanOperate',
    component: () => import("@/views/inspection/plan/operateV2.vue"),
    name: "巡检计划操作",
    meta: {
      title: "巡检计划操作",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionPlanDetails',
    component: () => import("@/views/inspection/plan/details.vue"),
    name: "巡检计划详情",
    meta: {
      title: "巡检计划详情",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionTask',
    component: () => import("@/views/inspection/task/list.vue"),
    name: "巡检任务",
    meta: {
      title: "巡检任务",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionTaskDisassembly',
    component: () => import("@/views/inspection/task/disassembly.vue"),
    name: "巡检任务拆解",
    meta: {
      title: "巡检任务拆解",
      keepAlive: true,
    },
  },
  // {
  //   path: '/inspectionTaskOperate',
  //   component: () => import("@/views/inspection/task/operate.vue"),
  //   name: "巡检任务操作",
  //   meta: {
  //     title: "巡检任务操作",
  //     keepAlive: true,
  //   },
  // },
  {
    path: '/inspectionTaskDetails',
    component: () => import("@/views/inspection/task/details.vue"),
    name: "巡检任务详情",
    meta: {
      title: "巡检任务详情",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionAccount',
    component: () => import("@/views/inspection/account/list.vue"),
    name: "巡检档案",
    meta: {
      title: "巡检档案",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionAccountFileDetails',
    component: () => import("@/views/inspection/account/fileDetails.vue"),
    name: "巡检档案详情",
    meta: {
      title: "巡检档案详情",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionRecord',
    component: () => import("@/views/inspection/account/inspectionRecord.vue"),
    name: "巡检记录",
    meta: {
      title: "巡检记录",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionAccountDetails',
    component: () => import("@/views/inspection/account/details.vue"),
    name: "巡检记录详情",
    meta: {
      title: "巡检记录详情",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionCycle',
    component: () => import("@/views/inspection/config/cycle.vue"),
    name: "巡检周期",
    meta: {
      title: "巡检周期",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionStandard',
    component: () => import("@/views/inspection/config/standard.vue"),
    name: "巡检标准",
    meta: {
      title: "巡检标准",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionStaOperate',
    component: () => import("@/views/inspection/config/standardOperate.vue"),
    name: "巡检标准操作",
    meta: {
      title: "巡检标准操作",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionResult',
    component: () => import("@/views/inspection/config/result.vue"),
    name: "巡检结果",
    meta: {
      title: "巡检结果",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionType',
    component: () => import("@/views/inspection/config/type.vue"),
    name: "巡检类型",
    meta: {
      title: "巡检类型",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionItems',
    component: () => import("@/views/inspection/config/InspectionItems.vue"),
    name: "巡检项",
    meta: {
      title: "巡检项",
      keepAlive: true,
    },
  },
  {
    path: '/inspectionItemDetails',
    component: () => import("@/views/inspection/config/itemDetails.vue"),
    name: "巡检项详情",
    meta: {
      title: "巡检项详情",
      keepAlive: true,
    },
  },
  {
    path: '/addTask',
    component: () => import("@/views/inspection/task/addTask.vue"),
    name: "新增巡检任务",
    meta: {
      title: "新增巡检任务",
      keepAlive: true,
    },
  },
]