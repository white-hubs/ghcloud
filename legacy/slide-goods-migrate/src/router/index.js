import goods from './modules/goods'

const routes = [
  { path: '/login', name: 'login', component: () => import('@/views/login/index.vue') },
  { path: '/', name: 'home', component: () => import('@/views/Home.vue') },
  ...goods,
];

export default routes;
