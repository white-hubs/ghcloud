/** 权限路由相关类型 */
declare namespace Route {
  interface RouteRecordRaw {
    name: string;
    path: string;
    component: any;
    icon?: string;
    children?: Route.RouteRecordRaw;
  }
}
declare module 'tank-vue3-seamless-scroll'
