import type { RouteRecordRaw } from "vue-router";

import { CONFIG_SHELL_PATH, LEGACY_CONFIG_REDIRECTS } from "@/views/project/project.const";

const legacyRedirectRoutes: RouteRecordRaw[] = LEGACY_CONFIG_REDIRECTS.map((item) => ({
  path: item.path,
  redirect: (to) => {
    const query = {
      ...to.query,
      tab: item.tab,
    };
    // 旧 /set-screen?id= 映射为壳内 guideId
    if (item.path === "/set-screen" && typeof to.query.id === "string" && to.query.id) {
      query.guideId = to.query.id;
    }
    return {
      path: CONFIG_SHELL_PATH[item.group],
      query,
    };
  },
}));

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/project",
  },
  {
    path: "/project",
    name: "ProjectList",
    component: async () => (await import("@/views/project/project-list")).default,
    meta: {
      title: "项目管理",
    },
  },
  {
    path: "/config/business",
    name: "BusinessConfig",
    component: async () => (await import("@/views/module/visual-config/business/business-config-shell")).default,
    meta: {
      title: "业务配置",
    },
  },
  {
    path: "/config/model",
    name: "ModelConfig",
    component: async () => (await import("@/views/module/visual-config/model/model-config-shell")).default,
    meta: {
      title: "模型配置",
    },
  },
  ...legacyRedirectRoutes,
];
