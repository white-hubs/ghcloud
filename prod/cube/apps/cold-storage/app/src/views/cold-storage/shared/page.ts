import type { RouteLocationRaw, Router } from "vue-router";

export function pushByHistory(router: Router, location: RouteLocationRaw): void {
  const resolved = router.resolve(location);
  window.history.pushState(window.history.state, "", resolved.href);
  window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
}

export function goBack(router: Router, fallback?: RouteLocationRaw): void {
  void router;
  void fallback;
  window.history.back();
}
