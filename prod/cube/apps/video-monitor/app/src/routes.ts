import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/permissions",
  },
  {
    path: "/ai-inspection/plans",
    name: "AiInspectionPlanList",
    component: async () => (await import("@/views/ai-inspection/plan-list")).default,
    meta: {
      title: "巡检计划",
      permissionCode: "aiInspection:plan:view",
      menuTitle: "计划",
    },
  },
  {
    path: "/ai-inspection/plans/create",
    name: "AiInspectionPlanCreate",
    component: async () => (await import("@/views/ai-inspection/plan-editor")).default,
    props: {
      mode: "create",
    },
    meta: {
      title: "新增巡检计划",
      permissionCode: "aiInspection:plan:create",
      hidden: true,
    },
  },
  {
    path: "/ai-inspection/plans/:id/edit",
    name: "AiInspectionPlanEdit",
    component: async () => (await import("@/views/ai-inspection/plan-editor")).default,
    props: (route) => ({
      mode: "edit",
      id: route.params.id as string,
    }),
    meta: {
      title: "编辑巡检计划",
      permissionCode: "aiInspection:plan:update",
      hidden: true,
    },
  },
  {
    path: "/ai-inspection/tasks",
    name: "AiInspectionTaskList",
    component: async () => (await import("@/views/ai-inspection/task-list")).default,
    meta: {
      title: "巡检任务",
      permissionCode: "aiInspection:task:view",
      menuTitle: "任务",
    },
  },
  {
    path: "/ai-inspection/tasks/:id",
    name: "AiInspectionTaskDetail",
    component: async () => (await import("@/views/ai-inspection/task-detail")).default,
    props: (route) => ({
      id: route.params.id as string,
    }),
    meta: {
      title: "巡检任务详情",
      permissionCode: "aiInspection:task:view",
      hidden: true,
    },
  },
  {
    path: "/ai-inspection/events",
    name: "AiInspectionEventList",
    component: async () => (await import("@/views/ai-inspection/event-list")).default,
    meta: {
      title: "异常事件",
      permissionCode: "aiInspection:event:view",
      hidden: true,
    },
  },
  {
    path: "/permissions",
    name: "PermissionList",
    component: async () => (await import("@/views/permission/permission-list")).default,
    meta: {
      title: "监控权限列表",
    },
  },
  {
    path: "/permissions/new",
    name: "PermissionCreate",
    component: async () => (await import("@/views/permission/permission-editor")).default,
    props: {
      mode: "create",
    },
    meta: {
      title: "新增监控权限",
    },
  },
  {
    path: "/permissions/:id/edit",
    name: "PermissionEdit",
    component: async () => (await import("@/views/permission/permission-editor")).default,
    props: (route) => ({
      mode: "edit",
      id: route.params.id as string,
    }),
    meta: {
      title: "编辑监控权限",
    },
  },
  {
    path: "/permissions/:id/detail",
    name: "PermissionDetail",
    component: async () => (await import("@/views/permission/permission-editor")).default,
    props: (route) => ({
      mode: "detail",
      id: route.params.id as string,
    }),
    meta: {
      title: "监控权限详情",
    },
  },
];
