import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  onUnmounted,
  watch,
  computed,
  nextTick,
  watchEffect
} from 'vue'
import { SketchRule } from 'vue3-sketch-ruler'
import { listen } from 'dom-helpers'
import styles from './index.module.less'
import throttle from 'lodash/throttle'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { usekeyBoard } from '@/hooks/use-keyboard.hook'
export const ConfigRuler = defineComponent({
  setup: (props, { slots }) => {
    const thick = 20
    const chartEditStore = useChartEditStore()
    usekeyBoard()
    let prevMoveXValue = [0, 0]
    let prevMoveYValue = [0, 0]
    const lines = reactive({ h: [], v: [] })
    const sketchRuleReDraw = ref(true)
    const appRef = ref<HTMLElement>()
    const refSketchRuleBox = ref<HTMLElement>()
    const containerRef = ref<HTMLElement>()
    const startX = ref(0)
    const startY = ref(0)
    const isPressSpace = ref(false)
    const width = ref(chartEditStore.getCanvasScaleRect.width)
    const height = ref(chartEditStore.getCanvasScaleRect.height)
    const scale = ref(2)
    // 主题
    const paletteStyle = {
      bgColor: '#18181c',
      longfgColor: '#4d4d4d',
      shortfgColor: '#4d4d4d',
      fontColor: '#4d4d4d',
      shadowColor: '#18181c',
      borderColor: '#18181c',
      cornerActiveColor: '#18181c',
    }
    // 滚动条拖动的高度
    const containerWidth = computed(() => {
      return `${height.value * 2}px`
    })
    // 处理鼠标拖动
    const handleWheel = (e: WheelEvent): void => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const nextScale = parseFloat(
          Math.max(0.2, scale.value - e.deltaY / 1000).toFixed(2)
        )
        nextScale > 2 ? scale.value = 2 : scale.value = nextScale
      }
      nextTick(() => {
        handleScroll()
      })
      chartEditStore.setScale(scale.value)
    }
    watchEffect(() => {
      scale.value = chartEditStore.editCanvas.scale
    })
    onMounted(() => {
      scale.value = 1
      if (appRef.value) {
        appRef.value.addEventListener('wheel', handleWheel, { passive: false })
        canvasPosCenter()
      }
    })
    onUnmounted(() => {
      if (appRef.value) {
        appRef.value.removeEventListener('wheel', handleWheel)
      }
    })
    // 计算画布大小
    const canvasBox = (): { width: number; height: number; } => {
      const layoutDom = document.getElementById('go-chart-edit-layout')
      if (layoutDom) {
        // 此处减去滚动条的宽度和高度
        const scrollW = 20
        return {
          height: layoutDom.clientHeight - scrollW,
          width: layoutDom.clientWidth - scrollW,
        }
      }
      return {
        width: width.value,
        height: height.value,
      }
    }
    // 滚动条处理
    const handleScroll = (): void => {
      if (!appRef.value) return
      if (!refSketchRuleBox.value) return
      const screensRect = appRef.value.getBoundingClientRect()
      const canvasRect = refSketchRuleBox.value.getBoundingClientRect()
      // 标尺开始的刻度
      startX.value = (screensRect.left + thick - canvasRect.left) / scale.value
      startY.value = (screensRect.top + thick - canvasRect.top) / scale.value
    }
    // 滚动居中
    const canvasPosCenter = (): void => {
      if (!containerRef.value) return
      if (!appRef.value) return
      const {
        width: containerWidth,
        height: containerHeight,
      } = containerRef.value.getBoundingClientRect()
      const { width, height } = canvasBox()
      appRef.value.scrollLeft = containerWidth / 2 - width / 2
      appRef.value.scrollTop = containerHeight / 2 - height / 2
    }
    // 拖拽处理  设置空格+鼠标左键监听画布移动
    const dragCanvas = (e: MouseEvent): void => {
      if (window?.$KeyboardActive?.space) {
        e.preventDefault()
        e.stopPropagation()
        if (e.which === 2) isPressSpace.value = true

        const startX = e.pageX
        const startY = e.pageY
        const listenMousemove = listen(window as Window, 'mousemove', (e: MouseEvent): void => {
          if (!appRef.value) return
          const nx = e.pageX - startX
          const ny = e.pageY - startY

          const [prevMoveX1, prevMoveX2] = prevMoveXValue
          const [prevMoveY1, prevMoveY2] = prevMoveYValue

          prevMoveXValue = [prevMoveX2, nx]
          prevMoveYValue = [prevMoveY2, ny]

          appRef.value.scrollLeft -=
       prevMoveX2 > prevMoveX1
         ? Math.abs(prevMoveX2 - prevMoveX1)
         : -Math.abs(prevMoveX2 - prevMoveX1)
          appRef.value.scrollTop -=
       prevMoveY2 > prevMoveY1
         ? Math.abs(prevMoveY2 - prevMoveY1)
         : -Math.abs(prevMoveY2 - prevMoveY1)
        })
        const listenMouseup = listen(window as any, 'mouseup', (): void => {
          listenMousemove()
          listenMouseup()
          prevMoveXValue = [0, 0]
          prevMoveYValue = [0, 0]
          isPressSpace.value = false
        })
      }
    }
    // 重绘标尺
    const reDraw = (): void => {
      sketchRuleReDraw.value = false
      setTimeout(() => {
        sketchRuleReDraw.value = true
      }, 10)
    }
    // 处理标尺重制大小
    watch(
      () => scale.value,
      (newValue, oldValue) => {
        if (oldValue !== newValue) {
          handleScroll()
          setTimeout(() => {
            if (containerRef.value) {
              canvasPosCenter()
            }
            reDraw()
          }, 400)
        } else {
          throttle(reDraw, 20)
        }
      }
    )
    return () => (
      <>
        <div class={styles['go-sketch-rule']}>
          {sketchRuleReDraw.value && (
            <SketchRule
              thick={thick}
              width={canvasBox().width}
              height={canvasBox().height}
              scale={scale.value}
              startX={startX.value}
              startY={startY.value}
              lines={lines}
              palette={paletteStyle}
              onWheel={handleWheel}
            />
          )}
          <div
            ref={appRef}
            class={styles['edit-screens']}
            onScroll={handleScroll}
          >
            <div
              ref={containerRef}
              class={styles['edit-screen-container']}
              style={{
                width: `${width.value * 2}px`,
                height: containerWidth.value,
              }}
            >
              <div
                ref={refSketchRuleBox}
                id='sketch-rule-box'
                class={styles.canvas}
                onMousedown={dragCanvas}
                style={{
                  marginLeft: `-${(canvasBox().width / 2 - 25)}px`,
                }}
              >
                <div style={{ pointerEvents: isPressSpace.value ? 'none' : 'auto' }}>
                  {slots.canvas?.()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  },
})
