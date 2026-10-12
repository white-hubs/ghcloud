import { useRoute } from 'vue-router'
export const useMetaTitle = (): void => {
  const route = useRoute()
  const { meta } = route
  document.title = meta.title as string
}
