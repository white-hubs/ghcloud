import type { Router } from "vue-router";

import { clearAuthSession, hasAuthSession, syncAuthFromUrl } from "@/api/session";

export const authGuard = (router: Router): void => {
  router.beforeEach(async (to) => {
    try {
      await syncAuthFromUrl();
    } catch {
      clearAuthSession();
    }
    const hasAuth = hasAuthSession();
    if (to.name === "login") {
      return hasAuth ? { name: "dashboard" } : true;
    }
    if (hasAuth) {
      return true;
    }
    return { name: "login" };
  });
};
