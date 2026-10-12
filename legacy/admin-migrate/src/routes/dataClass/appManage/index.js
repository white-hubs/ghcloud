export default [
  {
    path: "/appVersion",
    name: "app版本控制",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/appversion.vue"
      ),
    meta: {
      title: "app版本控制",
      keepAlive: true,
    },
  },
  {
    path: "/appManage",
    name: "应用列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/appManage.vue"
      ),
    meta: {
      title: "应用列表",
      keepAlive: true,
    },
  },
  {
    path: "/appGroup",
    name: "应用分组",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/appGroup.vue"
      ),
    meta: {
      title: "应用分组",
      keepAlive: true,
    },
  },
  {
    path: "/productLineManage",
    name: "产品线列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/productLineManage.vue"
      ),
    meta: {
      title: "产品线列表",
      keepAlive: true,
    },
  },
  {
    path: "/productManage",
    name: "产品列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/productManage.vue"
      ),
    meta: {
      title: "产品列表",
      keepAlive: true,
    },
  },
  {
    path: "/productInfoOperate",
    name: "产品操作",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/productInfoOperate.vue"
      ),
    meta: {
      title: "产品操作",
      keepAlive: true,
    },
  },
  {
    path: "/productSetApp",
    name: "产品配置应用",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/productSetApp.vue"
      ),
    meta: {
      title: "产品配置应用",
      keepAlive: true,
    },
  },
  {
    path: "/productSetTerminals",
    name: "产品配置访问端",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/productSetTerminals.vue"
      ),
    meta: {
      title: "产品配置访问端",
      keepAlive: true,
    },
  },
  {
    path: "/menuManage",
    name: "菜单列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/menuManage.vue"
      ),
    meta: {
      title: "菜单列表",
      keepAlive: true,
    },
  },
  {
    path: "/terminalManage",
    name: "访问端列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/terminalManage.vue"
      ),
    meta: {
      title: "访问端列表",
      keepAlive: true,
    },
  },
  // {
  //   path: "/businessRent",
  //   name: "企业租用",
  //   component: () =>
  //     import(
  //       /* webpackChunkName: "about" */ "@/views/traffic/appManage/businessRent.vue"
  //     ),
  //   meta: {
  //     title: "企业租用",
  //     keepAlive: true,
  //   },
  // },
  {
    path: "/addApp",
    name: "添加应用",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/addApp.vue"
      ),
    meta: {
      title: "添加应用",
      keepAlive: true,
    },
  },
  {
    path: "/addAppMenu",
    name: "添加菜单",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/addAppMenu.vue"
      ),
    meta: {
      title: "添加菜单",
      keepAlive: true,
    },
  },
  {
    path: "/tenantDict",
    name: "租户字典",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/dict-manage/tenant-dict/index.vue"
      ),
    meta: {
      title: "租户字典",
      keepAlive: true,
    },
  },
  {
    path: "/tenantDictTree",
    name: "租户字典树",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/dict-manage/tenant-dict-tree/index.vue"
      ),
    meta: {
      title: "租户字典树",
      keepAlive: true,
    },
  },
  {
    path: "/sysDict",
    name: "系统字典",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/dict-manage/system-dict/index.vue"
      ),
    meta: {
      title: "系统字典",
      keepAlive: true,
    },
  },
  {
    path: "/addTerminal",
    name: "添加访问端",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/appManage/addTerminal.vue"
      ),
    meta: {
      title: "添加访问端",
      keepAlive: true,
    },
  },
  {
    path: "/expUsers",
    name: "体验用户",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/expUsers.vue"
      ),
    meta: {
      title: "体验用户",
      keepAlive: true,
    },
  },
];
