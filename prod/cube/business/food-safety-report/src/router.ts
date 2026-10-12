export const routes: any = [
  {
    path: '/',
    redirect: 'report'
  },
  {
    path: '/report',
    name: '食安报表',
    component: async () => (await import('@/views/food-safety-report/index')).FoodSafetyReport
  },
]
