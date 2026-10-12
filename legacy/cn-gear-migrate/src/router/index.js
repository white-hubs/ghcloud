import gear from './modules/gear'

const routes = [
  { path: '/login', name: 'login', component: () => import(/* webpackChunkName: "home" */ '@/views/login/index.vue') },
  { path: '/', name: 'home', component: () => import(/* webpackChunkName: "about" */ '@/views/Home.vue') },
  ...gear,
];

export default routes;
