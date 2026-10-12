import contract from './modules/contract'

const routes = [
  { path: '/login', name: 'login', component: () => import(/* webpackChunkName: "home" */ '@/views/login/index.vue') },
  { path: '/', name: 'home', component: () => import(/* webpackChunkName: "about" */ '@/views/Home.vue') },
  ...contract,
];

export default routes;
