import { useRoute } from 'vue-router'
export const useMetaTitle = (title?: string): void => {
  const route = useRoute()
  document.title = title || (route?.meta.title as string)
}
