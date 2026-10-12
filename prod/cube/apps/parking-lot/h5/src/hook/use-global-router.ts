import { useRoute, useRouter, type RouteLocationNormalizedLoaded, type Router } from 'vue-router'

export function useGlobalRouter (): {
  router: Router;
  route: RouteLocationNormalizedLoaded;
}{
  // @ts-ignore
  const router = useRouter() ?? window.__CUBE_H5_VUE_ROUTER__
  // @ts-ignore
  const route = useRoute() ?? (window.__CUBE_H5_VUE_ROUTER__ as Router).currentRoute._value
  return {
    router,
    route,
  }
}