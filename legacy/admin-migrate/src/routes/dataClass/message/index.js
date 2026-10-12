export default [
  {
    path: "/template-manage",
    name: "模板管理",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/message/template-manage.vue"
      ),
    meta: {
      title: "模板管理",
      keepAlive: true,
    },
  },
  {
    path: "/addTemplate",
    name: "新增模板",
    component: () =>
      import(
        /* webpackChunkName: "about" */ "@/views/message/addTemplate.vue"
      ),
    meta: {
      title: "新增模板",
      keepAlive: true,
    },
  },
];
