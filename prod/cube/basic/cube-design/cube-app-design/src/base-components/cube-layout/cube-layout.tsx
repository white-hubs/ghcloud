import { defineComponent, ref, provide, onMounted, watch, nextTick } from 'vue'
import styles from './cube-layout.module.less'
import { VerticalLine } from '../vertical-line/vertical-line'

export const TABLE_SCROLL_REF_KEY = Symbol('tableScrollRef')

export const CubeLayout = defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    showFooter: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showTableXScroll: {
      type: Boolean,
      default: false
    }
  },
  setup: (props, { slots, expose }) => {
    const tableScrollRef = ref<HTMLDivElement | null>(null)
    const scrollCaptureRef = ref<HTMLDivElement | null>(null)
    const contentRef = ref<HTMLDivElement | null>(null)
    const handleWheel = (e: WheelEvent): void => {
      if (tableScrollRef.value) {
        if (e.deltaX !== 0) {
          e.preventDefault()
          tableScrollRef.value.scrollLeft += e.deltaX
        }
      }
    }
    // 更新滚动捕获区域的高度
    const updateCaptureAreaHeight = (): void => {
      if (!scrollCaptureRef.value || !contentRef.value) return
      const formElement = document.querySelector('[class*="query-form-header"]')
      const tableElement = document.getElementById('cube-table')
      if (!tableElement) return
      const tableHeight = tableElement.getBoundingClientRect().bottom + 110
      const formHeight = formElement ? formElement.getBoundingClientRect().height : 0
      const contentHeight = contentRef.value.getBoundingClientRect().height
      const captureHeight = Math.max(contentHeight - formHeight - tableHeight, 0)

      scrollCaptureRef.value.style.height = `${captureHeight}px`
    }
    watch(() => props.showTableXScroll, (newVal) => {
      if (newVal) {
        nextTick(() => {
          updateCaptureAreaHeight()
        })
      }
    })
    onMounted(async () => {
      await nextTick()
      if (props.showTableXScroll) {
        updateCaptureAreaHeight()
        window.addEventListener('resize', updateCaptureAreaHeight)
      }
    })

    provide(TABLE_SCROLL_REF_KEY, {
      tableScrollRef,
      showTableXScroll: props.showTableXScroll,
      updateCaptureAreaHeight
    })

    expose({
      tableScrollRef,
      updateCaptureAreaHeight
    })

    return (): JSX.Element =>
      <div class={styles['layout-container']}>
        <div class={styles['layout-header']} v-show={props.showHeader}>
          <VerticalLine title={props.title} />
          {slots['layout-header']?.()}
        </div>
        <div id='cube-layout-content' class={`${styles['layout-content']} ${!props.showFooter ? styles['no-footer'] : ''} ${props.showTableXScroll ? styles['has-table-scroll'] : ''}`} ref={contentRef} >
          {slots['layout-content']?.()}
          {props.showTableXScroll && (
            <>
              <div class={styles['scroll-capture-area']} ref={scrollCaptureRef} onWheel={handleWheel} ></div>
            </>
          )}
        </div>
        {props.showTableXScroll && (
          <>
            <div class={styles['table-scroll-container']} id="cube-table-scroll-container" ref={tableScrollRef}>
              <div class={styles['table-scroll-content']} id="cube-table-scroll-content"></div>
            </div>
          </>
        )}
        {
          props.showFooter &&
          <div class={styles['layout-footer']}>
            <div class={styles['footer-btn']}>
              {slots['footer-btn']?.()}
            </div>
            <div class={styles['footer-page']}>
              {slots['footer-page']?.()}
            </div>
          </div>
        }

        {slots.default?.()}
      </div>
  }
})
