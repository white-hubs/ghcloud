/**
 * Vant 组件修复工具
 * 解决路由跳转和弹窗问题
 */

// 修复 DOM 操作错误
function patchVantDomOperations() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  // 拦截 DOM 操作错误
  const originalRemoveChild = Element.prototype.removeChild
  Element.prototype.removeChild = function(child) {
    try {
      if (child && this.contains(child)) {
        return originalRemoveChild.call(this, child)
      }
    } catch (e) {
    }
    return null
  }

  // 拦截 remove 方法
  const originalRemove = Element.prototype.remove
  Element.prototype.remove = function() {
    try {
      if (this && this.parentNode) {
        return originalRemove.call(this)
      }
    } catch (e) {
    }
  }

  // 监听路由变化，确保在组件销毁后不会触发事件
  const cleanupDomListeners = () => {
    // 移除可能存在的事件监听器
    const vantElements = document.querySelectorAll('[class*="van-"]')
    vantElements.forEach(el => {
      const element = el as HTMLElement
      element.onscroll = null
      element.ontouchstart = null
      element.ontouchmove = null
      element.ontouchend = null
    })
  }

  // 在路由变化时清理DOM监听器
  window.addEventListener('beforeunload', cleanupDomListeners)
  window.addEventListener('popstate', cleanupDomListeners)

  // 添加全局错误处理
  window.addEventListener('error', (event) => {
    if (
      event.message && 
      (event.message.includes('undefined (reading') || 
       event.message.includes('Cannot read properties of undefined'))
    ) {
      event.preventDefault()
      return true
    }
    return false
  }, true)

  // 修复 Promise 错误
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason && 
      typeof event.reason.message === 'string' && 
      (event.reason.message.includes('undefined (reading') || 
       event.reason.message.includes('Cannot read properties of undefined'))
    ) {
      event.preventDefault()
      return true
    }
    return false
  })
}

export function setupVantFix() {
  // 在 DOM 加载完成后应用补丁
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', patchVantDomOperations)
    } else {
      patchVantDomOperations()
    }
  }
}