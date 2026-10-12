import type { RouteRecordRaw } from "vue-router";
const routers: RouteRecordRaw[] = [
  {
    path: "/",
    component: async () => (await import("@/pages/ai-center/ai-center")).AiCenter,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/chat",
    component: async () => (await import("@/pages/chat/chat")).Chat,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: "/agent-detail/:id",
    component: async () => (await import("@/pages/ai-center/agent-detail")).AgentDetail,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: "auth-login",
    path: "/auth/login",
    component: async () => (await import("@ghcloud/cube-h5-auth")).LoginPage,
    meta: {
      title: "登录",
      public: true,
    },
  },
  {
    path: "/agent-select",
    component: async () => (await import("@/pages/agent-select/agent-select")).AgentSelect,
    meta: {
      requiresAuth: true,
    },
  },
];

export const routes: RouteRecordRaw[] = [...routers];
