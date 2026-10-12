import { themeManager, antd3LegacyThemeManager } from '@/theme'

interface UseAntDTheme {
  themeInject: () => void;
}

export const useAntDTheme = (): UseAntDTheme => {
  const themeInject = (): void => {
    themeManager.mount()
    antd3LegacyThemeManager.mount()
    themeManager.use('极光绿')
    antd3LegacyThemeManager.use('极光绿')
  }

  return {
    themeInject
  }
}
