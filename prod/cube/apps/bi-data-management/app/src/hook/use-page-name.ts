import { useRoute } from 'vue-router'

export function usePageName (): { title: string; } {
  const route = useRoute()
  return { title: route.meta.title as string }
}
