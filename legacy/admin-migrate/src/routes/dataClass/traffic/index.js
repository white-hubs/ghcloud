
export default [
  {
    path: "/userList",
    name: "用户列表",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/platformUser/userList.vue"
      ),
    meta: {
      title: "用户列表",
      keepAlive: true,
    },
  },
  {
    path: "/setPassword",
    name: "密码设置",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/platformUser/setPassword.vue"
      ),
    meta: {
      title: "密码设置",
      keepAlive: true,
    },
  },
  {
    path: "/businessList",
    name: `租户列表`,
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/businessList/businessList.vue"
      ),
    meta: {
      title: `租户列表`,
      keepAlive: true,
    },
  },
  {
    path: "/enterpriseLease",
    name: `租户租用详情`,
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/businessList/enterpriseLease.vue"
      ),
    meta: {
      title: `租户租用详情`,
      keepAlive: true,
    },
  },
  {
    path: "/tenantRentConfig",
    name: `租户分配产品`,
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/businessList/tenantRentConfig.vue"
      ),
    meta: {
      title: `租户分配产品`,
      keepAlive: true,
    },
  },
  {
    path: "/businessOperate",
    name: `租户操作`,
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/businessList/businessOperate.vue"
      ),
    meta: {
      title: `租户操作`,
      keepAlive: true,
    },
  },
  {
    path: "/businessDetails",
    name: `租户详情`,
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/traffic/businessList/businessDetails.vue"
      ),
    meta: {
      title: `租户详情`,
      keepAlive: true,
    },
  },
];
