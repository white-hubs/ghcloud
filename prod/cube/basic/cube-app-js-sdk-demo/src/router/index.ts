const routers = [
  {
    name: 'index',
    path: '/',
    component: async () => (await import('@/views/entry/entry')).Entry,
  },

]

export const routes = [...routers]
