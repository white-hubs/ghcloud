import type { RouteLocationRaw, Router } from "vue-router";

import { usePageName } from "@ghcloud/cube-utils";

export function useLayoutTitle(fallback: string): string {
  const { pageTitle } = usePageName();
  return pageTitle || fallback;
}

export function pushByHistory(router: Router, location: RouteLocationRaw): void {
  const resolved = router.resolve(location);
  window.history.pushState(window.history.state, "", resolved.href);
  window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
}

export function goBack(router: Router, _fallback?: RouteLocationRaw): void {
  window.history.back();
}
