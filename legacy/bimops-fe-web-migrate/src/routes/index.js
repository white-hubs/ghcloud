import { getActivePinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";

import { handleThirdLoginGuard } from "./third-login-guard";
import { usePortalLayoutStore } from "@/hooks/use-portal-layout-store";
import { isWorkbenchEntryEnabled } from "@/utils/portal-entry";
import LoginView from "@/views/login/login.vue";

const whiteList = ["Login", "verify-auth"];

const routes = [
  {
    path: "/login",
    name: "Login",
    component: LoginView,
  },
  {
    path: "/verify-auth",
    name: "verify-auth",
    component: () => import("@/views/verify-auth/verify-auth.vue"),
  },
  {
    path: "/",
    component: () => import("@/views/platform/home"),
    redirect: "/portal-entry",
    children: [
      {
        path: "/portal-entry",
        name: "PortalEntry",
        component: () => import("@/views/platform/portal-entry.vue"),
      },
      {
        path: "/no-application",
        name: "NoApplication",
        component: () => import("@/views/platform/no-application.vue"),
      },
      {
        path: "/index",
        name: "Index",
        component: () => import("@/views/platform/index.vue"),
      },
      {
        path: "/about",
        name: "About",
        component: () => import("@/views/About.vue"),
      },
      {
        path: "/workbench",
        name: "workbench",
        component: () => import("@/views/platform/index.vue"),
      },
      {
        path: "/portal:pathMatch(.*)",
        name: "portal",
        component: () => import("@/views/About.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const cubeMfRootGlobalState = CubeMfRootGlobalState.getInstance();
  const authInfo = cubeMfRootGlobalState.mfRootState.authInfo;
  const pinia = getActivePinia();
  const portalStore = pinia != null ? usePortalLayoutStore(pinia) : null;

  if (whiteList.includes(to.name)) {
    portalStore?.clear();
    next();
    return;
  }
  const handled = await handleThirdLoginGuard({
    to,
    authInfo,
    portalStore,
    next,
  });
  if (handled) {
    return;
  }
  if (!authInfo?.token) {
    portalStore?.clear();
    next({ path: "/login", replace: true });
    return;
  }

  // 工作台关闭后，旧收藏、地址栏访问和刷新 /index 均回到统一门户入口。
  if (["/index", "/workbench"].includes(to.path) && !(await isWorkbenchEntryEnabled())) {
    next({ path: "/portal-entry", replace: true });
    return;
  }

  portalStore?.syncFromRoute(to);
  next();
});

export default router;
