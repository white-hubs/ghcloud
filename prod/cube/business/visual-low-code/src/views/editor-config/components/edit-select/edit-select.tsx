import { defineComponent, toRefs, ref, watch } from 'vue'

import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import styles from './edit-select.module.less'
import { useSizeStyle, useComponentStyle } from '@/hooks/use-style.hooks'
import { selectBoxIndex } from '@/setting/design-setting'
export default defineComponent({
  name: 'EditSelect',
  setup () {
    const chartEditStore = useChartEditStore()
    const { isSelect, scale } = toRefs(chartEditStore.getEditCanvas)
    watch(
      () => chartEditStore.getMousePosition,
      positionInfo => {
        if (!isSelect.value) return
        // 这里的 x,y 是已经计算过的相对位移值
        const { startX, startY, x, y } = positionInfo
        const attr = {
          zIndex: selectBoxIndex,
          // left
          x: 0,
          // top
          y: 0,
          // 宽
          w: 0,
          // 高
          h: 0,
          // 偏移
          offsetX: 0,
          offsetY: 0
        }

        // 处理位置
        if (x > startX && y > startY) {
          // 右下方向
          attr.x = startX
          attr.y = startY
          attr.w = Math.round((x - startX) / scale.value)
          attr.h = Math.round((y - startY) / scale.value)
        } else if (x > startX && y < startY) {
          // 右上方向
          attr.x = startX
          attr.w = Math.round((x - startX) / scale.value)
          attr.h = Math.round((startY - y) / scale.value)
          attr.y = startY - attr.h
        } else if (x < startX && y > startY) {
          // 左下方向
          attr.y = startY
          attr.w = Math.round((startX - x) / scale.value)
          attr.h = Math.round((y - startY) / scale.value)
          attr.x = startX - attr.w
        } else {
          // 左上方向
          attr.w = Math.round((startX - x) / scale.value)
          attr.h = Math.round((startY - y) / scale.value)
          attr.x = startX - attr.w
          attr.y = startY - attr.h
        }
        positionStyle.value = {
          ...useComponentStyle(attr, selectBoxIndex),
          ...useSizeStyle(attr)
        }
      },
      {
        deep: true
      }
    )
    const positionStyle = ref()
    return () => (
      <>{
        isSelect.value ? <div class={styles['go-edit-select']} style={positionStyle.value}><div class={styles['select-background']} /><div class={styles['select-border']} /></div> : null
        }
      </>
    )
  }
})
