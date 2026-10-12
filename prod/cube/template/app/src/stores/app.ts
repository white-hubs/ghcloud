import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * 示例 Pinia store。默认 `Application#installPinia` 已装配 Pinia，业务侧可直接 `useAppStore()`。
 *
 * 约定：
 * - 每个 store 文件一个 `useXxxStore`，推荐 Composition API 风格
 * - store 名字用 kebab-case（与 oxlint 的文件名规则保持一致）
 * - 跨页面/跨组件共享的状态放这里；页面内局部状态用 `ref`/`reactive` 即可
 */
export const useAppStore = defineStore('app', () => {
  const collapsed = ref(false)

  const toggleCollapsed = (): void => {
    collapsed.value = !collapsed.value
  }

  return {
    collapsed,
    toggleCollapsed,
  }
})
