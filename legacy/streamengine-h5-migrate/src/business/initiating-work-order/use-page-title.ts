import { ref } from 'vue'

// 使用 Composable 共享状态，避免 Provide/Inject 的层级问题
const pageTitle = ref<string>('工单')

export function usePageTitle() {
  const updatePageTitle = (title: string) => {
    if (title) {
      pageTitle.value = title
    }
  }

  return {
    pageTitle,
    updatePageTitle
  }
}

