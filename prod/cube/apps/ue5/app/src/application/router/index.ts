import { createRouter, createWebHistory, type RouteLocationNormalized, type RouteRecordRaw } from "vue-router";

import { CubeMfRootGlobalState } from "@ghcloud/cube-mf-root";
import { initCubePlayerAuth, loadPlayerSDK } from "@ghcloud/cube-player";

import { authStore, initAuthStore } from "@/application/auth/auth-store";
import { getSessionAuth, hasAuthSession } from "@/application/auth/session";
import { showUe5BootLoader } from "@/application/bootstrap/boot-loader";
import { APP_ROUTE_PREFIX } from "@/constants/env";

export const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: (to) => ({
      path: "/login",
      query: to.query,
    }),
  },
  {
    path: "/login",
    name: "login",
    component: async () => {
      const module = await import("@/views/login/index");
      return module.default;
    },
  },
  {
    path: "/home",
    name: "home",
    component: async () => {
      const module = await import("@/views/visualization/index");
      return module.default;
    },
  },
];

const router = createRouter({
  history: createWebHistory(APP_ROUTE_PREFIX),
  routes,
});

router.beforeEach((to: RouteLocationNormalized, from, next) => {
  if (to.name === "login") {
    next();
    return;
  }

  if (hasAuthSession()) {
    const auth = getSessionAuth();
    initAuthStore(auth);
    try {
      CubeMfRootGlobalState.getInstance().mfRootState.authInfo = { ...auth };
    } catch {
      // ignore before mf root init
    }
    initCubePlayerAuth(authStore);
    void loadPlayerSDK().catch((error) => {
      console.warn("[router] loadPlayerSDK failed", error);
    });
    if (to.name === "home" && from.name !== "home") {
      showUe5BootLoader("viz");
    }
    next();
    return;
  }

  sessionStorage.clear();
  next({ path: "/login", query: to.query });
});

export default router;

/** @deprecated use default router export */
export const authGuard = (): void => {};
