import type { RouteRecordRaw } from "vue-router";

export const graphEditorRoutes: RouteRecordRaw[] = [
  {
    path: "/editor",
    name: "graph-editor",
    meta: {
      title: "图编辑器",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/graph-editor/graph-editor")).GraphEditor,
  },
  {
    path: "/lineLoss",
    name: "line-loss-management",
    meta: {
      title: "线损编辑器",
      requiresAuth: true,
    },
    component: async () => (await import("@/views/line-loss-management/line-loss-management")).LineEditor,
  },
];
