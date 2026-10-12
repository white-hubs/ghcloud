import { useRoute } from 'vue-router'
export const useMetaTitle = (name?: string): void => {
  const route = useRoute()
  const { meta } = route
  document.title = name ?? meta.title as string
}
