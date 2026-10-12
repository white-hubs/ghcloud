import { useGlobalRouter } from '../hook/use-global-router'

export const useMetaTitle = (name?: string): void => {
  const { route } = useGlobalRouter()
  const { meta } = route
  document.title = name ?? meta.title as string
}
