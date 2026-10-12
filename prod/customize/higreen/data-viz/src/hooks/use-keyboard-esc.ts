import { message } from '@ghcloud/cube-ui'
import { onMounted, onUnmounted } from 'vue'

/**
 * 键盘Control+Esc返回hook
 * @param callback 按下Control+Esc时执行的回调函数
 */
export function useKeyboardEsc (callback: () => void): void {
  // 添加键盘事件处理函数
  const handleKeyDown = (event: KeyboardEvent): void => {
    // 检测Control+Esc组合键
    if (event.key === 'Escape' && event.ctrlKey) {
      event.preventDefault()
      callback()
    }
  }

  // 组件挂载时添加键盘事件监听
  onMounted(() => {
    message.destroy()
    // message.info('按 Control+Esc 返回大屏总览');
    window.addEventListener('keydown', handleKeyDown)
  })

  // 组件卸载时移除键盘事件监听
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}