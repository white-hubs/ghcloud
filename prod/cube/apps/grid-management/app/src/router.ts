import { routes as gridManagementRoutes } from "./router/router";
import type { RouteRecordRaw } from "vue-router";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "task-plan",
  },
  ...gridManagementRoutes,
];
