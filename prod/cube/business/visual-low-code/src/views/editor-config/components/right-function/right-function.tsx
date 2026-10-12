import { defineComponent, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import {
  List, ListItem, Layers,
  LayersOutline,
  Icon,
  ArrowUp,
  ArrowDown
} from '@ghcloud/visual-view-ui'
export const RightFunction = defineComponent({
  setup: () => {
    const chartEditStore = useChartEditStore()
    const position = ref({ x: 0, y: 0, display: 'none' })
    watch(() => chartEditStore.getCurrentBlock, () => {
      const curb = chartEditStore.getCurrentBlock
      if (curb?.styles?.width) {
        // 计算x坐标
        if (curb.styles.x + curb.styles.width + 200 > chartEditStore.getCanvasScaleRect.width) {
          if (curb.styles.width / 2 < 200) {
            position.value.x = curb.styles.x - 200
          } else if (curb.styles.width / 2 > 200 && curb.styles.width > chartEditStore.getCanvasScaleRect.width - 200) {
            position.value.x = curb.styles.width / 2
          } else {
            position.value.x = curb.styles.x + curb.styles.width / 2
          }
        } else {
          position.value.x = curb.styles.x + curb.styles.width
        }
        // 计算y坐标
        if (curb.styles.y + curb.styles.height + 200 > chartEditStore.getCanvasScaleRect.height) {
          if (curb.styles.height / 2 < 200) {
            position.value.y = curb.styles.y - 200
          } else if (curb.styles.height / 2 > 200 && curb.styles.height > chartEditStore.getCanvasScaleRect.height - 200) {
            position.value.y = curb.styles.height / 2
          } else {
            position.value.y = curb.styles.y + curb.styles.height / 2
          }
        } else {
          position.value.y = curb.styles.y
        }
      }
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, (newVal, oldVal) => {
      if (chartEditStore.active.targetId.length === 0 || newVal[0] !== oldVal?.[0])position.value.display = 'none'
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getEditCanvas.isRightClick, (val) => {
      if (val && !chartEditStore.getCurrentBlock?.styles.isCombined && chartEditStore.active.targetId.length > 0) position.value.display = 'block'
    })
    const handleClick = (val: string): void => {
      const zIndexList = chartEditStore.getCurrentPageComponents.map(x => x.styles.zIndex ? x.styles.zIndex : 0).sort(function (a, b) { return a - b })
      const curIndex = chartEditStore.getCurrentBlock?.styles.zIndex ?? 0
      const max = Math.max(...zIndexList)
      const min = Math.min(...zIndexList)
      const upIndex = zIndexList.filter((x) => { return x > curIndex })[0] ?? curIndex
      const downFilter = zIndexList.filter((x) => { return x < curIndex })
      const dowIndex = downFilter[downFilter.length - 1] ?? curIndex
      if (chartEditStore.getCurrentBlock?.styles) {
        switch (val) {
          case 'top':
            chartEditStore.getCurrentBlock.styles.zIndex = max + 10
            break
          case 'up':
            chartEditStore.getCurrentBlock.styles.zIndex = upIndex + 10
            break
          case 'down':
            chartEditStore.getCurrentBlock.styles.zIndex = dowIndex - 10
            break
          case 'bottom':
            chartEditStore.getCurrentBlock.styles.zIndex = min - 10
            break
          default:
            break
        }
      }
      position.value.display = 'none'
    }
    return () => (
      <div class='component-shape' style={{ position: 'absolute', display: `${position.value.display}`, width: '200px', zIndex: '1000', cursor: 'pointer', left: `${position.value.x}px`, top: `${position.value.y}px` }}>
        <List>
          <div onClick={() => { handleClick('top') }}><ListItem prefix={<Icon><Layers /></Icon>}>置顶</ListItem></div>
          <div onClick={() => { handleClick('up') }}><ListItem prefix={<Icon><ArrowUp /></Icon>}>上一层</ListItem></div>
          <div onClick={() => { handleClick('down') }}><ListItem prefix={<Icon><ArrowDown /></Icon>}>下一层</ListItem></div>
          <div onClick={() => { handleClick('bottom') }}><ListItem prefix={<Icon><LayersOutline /></Icon>}>置底</ListItem></div>
        </List>
      </div>
    )
  },
})
