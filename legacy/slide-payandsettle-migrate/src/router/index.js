import payAndSettle from './modules/payAndSettle'

const routes = [
  { path: '/login', name: 'login', component: () => import(/* webpackChunkName: "home" */ '@/views/login/index.vue') },
  { path: '/', name: 'home', component: () => import(/* webpackChunkName: "about" */ '@/views/Home.vue') },
  ...payAndSettle,
];

export default routes;
