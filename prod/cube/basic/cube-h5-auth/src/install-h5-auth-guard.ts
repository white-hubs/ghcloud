import type { AuthSessionConfig } from "./auth-session";
import { authSession } from "./auth-session";
import type { Router } from "vue-router";

export interface InstallH5AuthGuardOptions extends AuthSessionConfig {
  loginPath?: string;
  requiresAuthMetaKey?: string;
  publicMetaKey?: string;
}

export const installH5AuthGuard = (router: Router, options: InstallH5AuthGuardOptions): void => {
  const { loginPath = "/auth/login", requiresAuthMetaKey = "requiresAuth", publicMetaKey = "public", ...sessionConfig } = options;
  authSession.setup(sessionConfig);
  router.beforeEach((to, _, next) => {
    if (to.meta?.[publicMetaKey]) {
      next();
      return;
    }
    if (!to.meta?.[requiresAuthMetaKey]) {
      next();
      return;
    }
    if (authSession.isInApp() || authSession.hasToken() || authSession.isGuestMode()) {
      next();
      return;
    }
    authSession.clearAuthInfo();
    authSession.saveRedirectFullPath(to.fullPath);
    next({
      path: loginPath,
      query: {
        redirect: encodeURIComponent(to.fullPath),
      },
    });
  });
};
