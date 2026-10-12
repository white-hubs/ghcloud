import { onBeforeUnmount } from 'vue'

interface UseUtils {
  calcChartFontSize: (size: number) => number;
}

/** 通用工具hook */
export const useUtils = (): UseUtils => {
  /** 动态计算fontSize
   * @param size 设计稿chart字体大小
   */
  function calcChartFontSize (size: number): number {
    const clientWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth
    if (!clientWidth) return 12
    const fontSize = clientWidth / 1440
    return size * fontSize
  }

  return {
    calcChartFontSize
  }
}

export const useApiTimer = (getDataFunction: () => Promise<void>): void => {
  let timer = null
  getDataFunction()
  timer = setInterval(() => {
    getDataFunction()
  }, 1000 * 60 * 5)
  onBeforeUnmount(() => {
    timer && clearInterval(timer)
  })
}
