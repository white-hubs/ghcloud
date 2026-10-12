import park from './modules/park.js'
import parking from './modules/parking.js'
import rout from './modules/route.js'

const routes = [
  { path: '/login', name: 'login', component: () => import(/* webpackChunkName: "home" */ '@/views/login/index.vue') },
  { path: '/', name: 'home', component: () => import(/* webpackChunkName: "about" */ '@/views/Home.vue') },
  ...park,
  ...parking,
  ...rout,
];

export default routes;
