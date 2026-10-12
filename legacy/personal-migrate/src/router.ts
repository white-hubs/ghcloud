import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: "/info",
    name: "个人管理",
    component: async () => (await import('@/views/pensonalInfo.vue')).default,
  },
  {
    path: "/modify-password",
    name: "修改密码",
    component: async () => (await import('@/views/modifyPassword.vue')).default,
  },
  {
    path: "/my-tenant",
    name: "我的企业",
    component: async () => (await import('@/views/myTenant.vue')).default,
  },
  {
    path: "/not-disturb",
    name: "消息免打扰",
    component: async () => (await import('@/views/not-disturb.vue')),
  },
]
