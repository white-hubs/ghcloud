export default [
    {
        path: '/timeLinkageList',
        component: () => import("@/views/timeLinkage/linkageList.vue"),
        name: "timeLinkageList",
        meta: {
          title: "定时联动列表",
          keepAlive: true,
        },
    },
    {
        path: '/timeLinkageDetail',
        component: () => import("@/views/timeLinkage/linkageDetail.vue"),
        name: "timeLinkageDetail",
        meta: {
          title: "定时联动详情",
          keepAlive: true,
        },
    },
    {
        path: '/timeLinkageEdit',
        component: () => import("@/views/timeLinkage/linkageEdit.vue"),
        name: "timeLinkageEdit",
        meta: {
          title: "定时联动编辑",
          keepAlive: true,
        },
    },
    {
        path: '/timeLinkageRecord',
        component: () => import("@/views/timeLinkage/linkageRecord.vue"),
        name: "timeLinkageRecord",
        meta: {
          title: "定时联动日志",
          keepAlive: true,
        },
    },
]