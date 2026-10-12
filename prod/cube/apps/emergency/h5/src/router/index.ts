import type { RouteRecordRaw } from "vue-router";

const routers: RouteRecordRaw[] = [
  {
    name: "emergency-event-task-list",
    path: "/",
    component: async () => (await import("@/views/emergency-event-task-list/emergency-event-task-list")).EmergencyEventTaskList,
  },
  {
    name: "emergency-event-task-detail",
    path: "/emergency-event-task-detail",
    component: async () =>
      (await import("@/views/emergency-event-task-detail/emergency-event-task-detail-with-devices")).EmergencyEventTaskDetail,
  },
  {
    name: "emergency-file-list",
    path: "/emergency-file-list",
    component: async () => (await import("@/views/emergency-file-list/emergency-file-list")).EmergencyFileList,
  },
  {
    name: "emergency-file-detail",
    path: "/emergency-file-detail",
    component: async () => (await import("@/views/emergency-file-detail/emergency-file-detail")).EmergencyFileDetail,
  },
];

export const routes: RouteRecordRaw[] = [...routers];
