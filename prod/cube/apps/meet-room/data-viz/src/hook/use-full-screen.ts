import { ref, type Ref } from 'vue'

interface UseFullScreen {
  isFullScreen: Ref<boolean>;
  toggleFullScreen: () => void;
  setScreenListener: () => void;
}

export const useFullScreen = (): UseFullScreen => {
  const isFullScreen = ref(!!document.fullscreenElement)
  const fullscreenNames = ['fullscreenElement', 'mozFullScreenElement', 'webkitFullscreenElement', 'msFullscreenElement']
  const fullNames = ['requestFullscreen', 'mozRequestFulLScreen', 'webkitRequestFullscreen', 'msRequestFullscreen']
  const exitNames = ['exitFullScreen', 'mozCancelFullScreen', 'webkitExitFullscreen', 'msExitFullscreen']

  /** 全屏/退出全屏 */
  const toggleFullScreen = (): void => {
    if (isFullScreen.value) {
      const supportExit = exitNames.find(name => name in document) ?? exitNames[0]
      supportExit && document[supportExit]()
    } else {
      const supportFull = fullNames.find(name => name in document.documentElement) ?? fullNames[0]
      supportFull && document.documentElement[supportFull]()
    }
    isFullScreen.value = !isFullScreen.value
  }

  /** 设置全屏监听事件 */
  const setScreenListener = (): void => {
    document.addEventListener('fullscreenchange', () => {
      const supportFullscreen = fullscreenNames.find(name => name in document) ?? fullscreenNames[0]
      isFullScreen.value = !!document[supportFullscreen]
    })
  }

  return {
    isFullScreen,
    toggleFullScreen,
    setScreenListener
  }
}
