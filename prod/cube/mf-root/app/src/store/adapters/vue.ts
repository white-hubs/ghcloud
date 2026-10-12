import { createPinia, type Pinia } from 'pinia'

// 提供给 Vue 应用的安装函数
export function createGlobalState (appInstance: { use: (arg0: Pinia) => void; }): void {
  const pinia = createPinia()
  appInstance.use(pinia)
}
