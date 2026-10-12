export default [
    {
        path: '/conditionalLinkageList',
        component: () => import("@/views/conditionalLinkage/linkageConfigList.vue"),
        name: "conditionalLinkageList",
        meta: {
          title: "条件联动列表",
          keepAlive: true,
        },
    },
    {
        path: '/conditionalLinkageDetail',
        component: () => import("@/views/conditionalLinkage/linkageDetail.vue"),
        name: "conditionalLinkageDetail",
        meta: {
          title: "条件联动详情",
          keepAlive: true,
        },
    },
    {
        path: '/conditionalLinkageEdit',
        component: () => import("@/views/conditionalLinkage/linkageConfigEdit.vue"),
        name: "conditionalLinkageEdit",
        meta: {
          title: "条件联动编辑",
          keepAlive: true,
        },
    },
    {
        path: '/conditionalLinkageRecord',
        component: () => import("@/views/conditionalLinkage/linkageRecord.vue"),
        name: "conditionalLinkageRecord",
        meta: {
          title: "条件联动日志",
          keepAlive: true,
        },
    },
]