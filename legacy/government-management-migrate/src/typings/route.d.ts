/** 权限路由相关类型 */
declare namespace AuthRoute {
  /** 路由的key */
  type RouteKey = string;

  /** 单个路由的类型结构(动态路由模式：后端返回此类型结构的路由) */
  interface Route {
    /** 路由名称(路由唯一标识) */
    name: RouteKey;
    /** 路由路径 */
    path: RoutePath;

    component: any;
  }
}
