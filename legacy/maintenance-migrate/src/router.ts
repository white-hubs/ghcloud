import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/maintenancePlan",
    name: '维保计划',
    component: () => import("@/views/maintenance/plan/list.vue"),
    meta: {
      title: "维保计划",
      keepAlive: true
    }
  },
  {
    path: "/maintenancePlanOperate",
    name: '维保计划操作',
    component: () => import("@/views/maintenance/plan/operate.vue"),
    meta: {
      title: "维保计划操作",
      keepAlive: true
    }
  },
  {
    path: "/maintenanceTask",
    name: '维保任务',
    component: () => import("@/views/maintenance/task/list.vue"),
    meta: {
      title: "维保任务",
      keepAlive: true
    }
  },
  {
    path: "/maintenanceTaskDetails",
    name: '维保任务详情',
    component: () => import("@/views/maintenance/task/details.vue"),
    meta: {
      title: "维保任务详情",
      keepAlive: true
    }
  },
  {
    path: "/maintenanceItem",
    name: '维保项',
    component: () => import("@/views/maintenance/config/item.vue"),
    meta: {
      title: "维保项",
      keepAlive: true
    }
  },
  {
    path: "/messageNotice",
    name: '消息配置',
    component: () => import("@/views/maintenance/config/messageNotice.vue"),
    meta: {
      title: "消息配置",
      keepAlive: true
    }
  },
  {
    path: "/maintenance-statistics",
    name: '维保统计',
    component: () => import("@/views/maintenance/statistics/index.vue"),
    meta: {
      title: "维保统计",
      keepAlive: true
    }
  },
  {
    path: "/maintenance-execute",
    name: '维保执行',
    component: async () => (await import("@/views/maintenance-execute/maintenance-execute")).MaintenanceExecute,
    meta: {
      title: "维保execute",
      keepAlive: true
    }
  },
]