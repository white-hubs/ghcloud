import { onMounted, onUnmounted } from 'vue'
export const usekeyBoard = (): void => {
  /** 卸载监听事件 */
  const removeKeyboard = (): void => {
    document.onkeydown = () => {}
    document.onkeyup = () => {}
  }
  /**
   * 处理键盘记录目前监听空格和ctrl
   */
  const keyRecordHandle = (): void => {
  // 默认赋值
    window.$KeyboardActive = {
      ctrl: false,
      space: false
    }

    document.onkeydown = (e: KeyboardEvent) => {
      const { keyCode } = e
      if (keyCode === 32 && e.target === document.body) e.preventDefault()

      if ([17, 32].includes(keyCode) && window.$KeyboardActive) {
        switch (keyCode) {
          case 17: window.$KeyboardActive.ctrl = true; break
          case 32: window.$KeyboardActive.space = true; break
        }
      }
      if ([83].includes(keyCode) && window.$KeyboardActive?.ctrl === true) {
        e.preventDefault()
      }
    }

    document.onkeyup = (e: KeyboardEvent) => {
      const { keyCode } = e
      if (keyCode === 32 && e.target === document.body) e.preventDefault()

      if ([17, 32].includes(keyCode) && window.$KeyboardActive) {
        switch (keyCode) {
          case 17: window.$KeyboardActive.ctrl = false; break
          case 32: window.$KeyboardActive.space = false; break
        }
      }
    }
  }
  onMounted(() => {
    keyRecordHandle()
  })
  onUnmounted(() => {
    removeKeyboard()
  })
}
