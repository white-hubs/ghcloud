import { ref, onMounted, onUnmounted, type Ref } from 'vue'
import { usePreviewFitScale, usePreviewFullScale } from './use-preview-scale.hook'
import { PreviewScaleEnum, previewScaleType } from '@/setting/design-setting'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
const chartEditStore = useChartEditStore()
interface ScaleHookState {
  previewRef: Ref<HTMLElement>;
  scaleRef: Ref<{ width: number;height: number; }>;
}
export const useScale = (): ScaleHookState => {
  const previewRef = ref()
  const width = ref(chartEditStore.getCanvasScaleRect.width)
  const height = ref(chartEditStore.getCanvasScaleRect.height)
  const scaleRef = ref({ width: 1, height: 1 })
  const updateScaleRef = (scale: { width: number; height: number; }): void => {
    // 这里需要解构，保证赋值给scaleRef的为一个新对象
    // 因为scale始终为同一引用
    scaleRef.value = { ...scale }
  }
  onMounted(() => {
    switch (previewScaleType) {
      case PreviewScaleEnum.FIT:
        (() => {
          const { calcRate, windowResize, unWindowResize } = usePreviewFitScale(
            width.value,
            height.value,
            previewRef.value,
            updateScaleRef
          )
          calcRate()
          windowResize()
          onUnmounted(() => {
            unWindowResize()
          })
        })()
        break
      case PreviewScaleEnum.FULL:
        (() => {
          const { calcRate, windowResize, unWindowResize } = usePreviewFullScale(
            width.value,
            height.value,
            previewRef.value,
            updateScaleRef
          )
          calcRate()
          windowResize()
          onUnmounted(() => {
            unWindowResize()
          })
        })()
        break
    }
  })
  return {
    previewRef,
    scaleRef
  }
}
