export default [
    {
        path: '/sceneLinkageList',
        component: () => import("@/views/sceneLinkage/linkageList.vue"),
        name: "sceneLinkageList",
        meta: {
          title: "场景联动列表",
          keepAlive: true,
        },
    },
    {
        path: '/sceneLinkageDetail',
        component: () => import("@/views/sceneLinkage/linkageDetail.vue"),
        name: "sceneLinkageDetail",
        meta: {
          title: "场景联动详情",
          keepAlive: true,
        },
    },
    {
        path: '/sceneLinkageEdit',
        component: () => import("@/views/sceneLinkage/linkageEdit.vue"),
        name: "sceneLinkageEdit",
        meta: {
          title: "场景联动编辑",
          keepAlive: true,
        },
    },
    {
        path: '/sceneLinkageRecord',
        component: () => import("@/views/sceneLinkage/linkageRecord.vue"),
        name: "sceneLinkageRecord",
        meta: {
          title: "场景联动日志",
          keepAlive: true,
        },
    },
]