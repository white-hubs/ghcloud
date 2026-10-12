import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory('streamengineH5'),
  routes: [
    {
      path: '/',
      name: 'hello',
      component: async () => import('./hello-world.vue'),
    },
    {
      path: '/dynamic-table',
      name: 'dynamic-table',
      component: async () => (await import('./business')).DynamicTable,
    },
    {
      path: '/public-form',
      name: 'public-form',
      component: async () => (await import('./business')).PublicForm,
    },
    {
      path: '/tab-form',
      name: 'tab-form',
      component: async () => (await import('./business')).TabForm,
    },
    {
      path: '/public-process',
      name: 'public-process',
      component: async () => (await import('./business')).PublicProcess,
    },
    {
      path: '/process',
      name: 'process',
      component: async () => (await import('./business')).Process,
    },
    {
      path: '/one-key-approve',
      name: 'oneKeyApprove',
      component: async () => (await import('./business')).OneKeyApprove,
    },
    {
      path:'/initiating-work-order',
      name:'initiating-work-order',
      component:async ()=>(await import('./business')).InitiatingWorkOrder
    },
    {
      path: '/personal-order-list',
      name: 'personal-order-list',
      component: async () => (await import('./business')).PersonalOrderList,
    },
  ]
})
