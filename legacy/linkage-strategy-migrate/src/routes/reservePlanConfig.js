export default [
    {
        path: '/reservePlanConfig',
        component: () => import("@/views/reservePlanConfig/config.vue"),
        name: "reservePlanConfig",
        meta: {
          title: "预案设置",
          keepAlive: true,
        },
    },
]