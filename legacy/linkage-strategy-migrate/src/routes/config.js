export default [
  {
    path: '/messageNotice',
    component: () => import("@/views/config/messageNotice.vue"),
    name: "messageNotice",
    meta: {
      title: "消息配置",
      keepAlive: true,
    },
  },
]