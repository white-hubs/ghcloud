export default {
  menu: (state) => state.menu.menu || sessionStorage.getItem("menu"),
  tabsPane: (state) => state.menu.tabsPane,
  app: (state) => state.menu.app || sessionStorage.getItem("app"),
  userInfo: (state) =>
    state.userInfo.userInfo || sessionStorage.getItem("userInfo"),
  tenant: (state) => state.tenant.tenant || sessionStorage.getItem("tenant"),
  appList: (state) =>
    state.appList.appList || sessionStorage.getItem("appList"),
};
