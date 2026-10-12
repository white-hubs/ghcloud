import type { RouteRecordRaw } from 'vue-router'

// export const routes: RouteRecordRaw[] = [
/** 权限路由相关类型 */
declare namespace AuthRoute {
  /** 路由的key */
  type RouteKey = string

  /** 单个路由的类型结构(动态路由模式：后端返回此类型结构的路由) */
  interface Route extends RouteRecordRaw {
    /** 路由名称(路由唯一标识) */
    name: RouteKey;
    /** 路由路径 */
    path: RoutePath;

    component: any;
    meta?: RouteMeta;
  }
}
