import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/areaManage",
    name: "区域管理",
    component: async () => (await import('@/views/area/areaManage.vue')).default,
  },
  {
    path: "/jgShortMessage",
    name: "极光配置",
    component: async () => (await import('@/views/messageConfig/jgShortMessage.vue')).default,
  },
  {
    path: "/sMedia",
    name: "流媒体配置",
    component: async () => (await import('@/views/equipConfig/sMedia.vue')).default,
  },
  {
    path: "/walkthrough",
    name: "漫游路径",
    component: async () => (await import('@/views/bimView/walkthrough.vue')).default,
  },
  {
    path: "/walkthrough",
    name: "漫游路径",
    component: async () => (await import('@/views/bimView/walkthrough.vue')).default,
  },
  {
    path: "/walkthroughDetail",
    name: "漫游路径详情",
    component: async () => (await import('@/views/bimView/walkthroughDetail.vue')).default,
  },
  {
    path: "/bimScene",
    name: "场景管理",
    component: async () => (await import('@/views/bimView/bimScene.vue')).default,
  },
  {
    path: "/modelList",
    name: "模型列表",
    component: async () => (await import('@/views/bimView/modelList.vue')).default,
  },
  {
    path: "/modelView",
    name: "模型视角",
    component: async () => (await import('@/views/bimView/modelView.vue')).default,
  },
  {
    path: "/modelNav",
    name: "模型导航",
    component: async () => (await import('@/views/bimView/modelNav.vue')).default,
  },
  {
    path: "/navMenu",
    name: "导航菜单",
    component: async () => (await import('@/views/bimView/navMenu.vue')).default,
  },
  {
    path: "/sceneBindDevice",
    name: "场景关联设备",
    component: async () => (await import('@/views/bimView/sceneBindDevice.vue')).default,
  },
  {
    path: "/mesManagement",
    name: "消息接收管理",
    component: async () => (await import('@/views/messageConfig/mes-management.vue')).default,
  },
  {
    path: "/channelManage",
    name: "渠道管理",
    component: async () => (await import('@/views/messageConfig/channel-manage.vue')).default,
  },
  {
    path: "/templateManage",
    name: "模板管理",
    component: async () => (await import('@/views/messageConfig/template-manage.vue')).default,
  },
  {
    path: "/newMessageNotice",
    name: "消息配置",
    component: async () => (await import('@/views/messageNotice/newMessageNotice.vue')).default,
  },
  {
    path: "/third-party-services",
    name: "第三方服务",
    component: async () => (await import('@/views/third-party-services/third-party-services.vue')).default,
  },
  {
    path: "/service-configuation",
    name: "业务配置",
    component: async () => (await import('@/views/service-configuation/service-configuation.vue')).default,
  },
  {
    path: "/alias-manage/terminal",
    name: "访问端别名配置",
    component: async () => (await import('@/views/service-configuation/alias-manage/detail-pages/terminal.vue')).default,
  },
  {
    path: "/alias-manage/application",
    name: "应用别名配置",
    component: async () => (await import('@/views/service-configuation/alias-manage/detail-pages/application.vue')).default,
  },
  {
    path: "/alias-manage/route",
    name: "alias-manage-router",
    component: async () => (await import('@/views/service-configuation/alias-manage/detail-pages/route.vue')).default,
  },
  {
    path: "/file-cleanup-config",
    name: "文件清理策略配置",
    component: async () => (await import('@/views/file-cleanup-config/file-cleanup-config.vue')).default,
  },
  {
    path: "/relate-area",
    name: "关联区域",
    component: async () => (await import('@/views/relate-area/relate-area.vue')).default,
  },
]
