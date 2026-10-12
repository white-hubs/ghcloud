import { createApp } from 'vue'
import { App } from './app'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import 'ant-design-vue/dist/reset.css'
import { authStore } from './state/auth'

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const auth = authStore.value
  if (!auth && to.path !== '/login') {
    next({ path: '/login' })
  } else {
    next()
  }
})

const app = createApp(App)


app.use(router)
app.mount('#app')