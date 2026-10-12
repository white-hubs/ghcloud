export default [
  {
    path: '/order-list',
    name: 'orderList',
    component: async (): Promise<unknown> => (await import('@/views/order-list/order-list')).OrderList
  },
  {
    path: '/order-report',
    name: 'orderReport',
    component: async (): Promise<unknown> => (await import('@/views/order-report/order-report')).OrderReport
  }
]
