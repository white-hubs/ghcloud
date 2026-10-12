import 'animate.css'

import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import styles from './layout.module.less'

const CONTENT_REVEAL_FALLBACK_MS = 2000

export const Layout = defineComponent({
  name: 'Layout',
  setup (_props, { slots }) {
    const loadContent = ref(false)
    const animationDuration = '1s'
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined

    const revealContent = (): void => {
      if (fallbackTimer != null) {
        clearTimeout(fallbackTimer)
        fallbackTimer = undefined
      }
      loadContent.value = true
      void nextTick(() => {
        globalThis.window.dispatchEvent(new Event('resize'))
      })
    }

    onMounted(() => {
      fallbackTimer = setTimeout(revealContent, CONTENT_REVEAL_FALLBACK_MS)
      
    })

    onBeforeUnmount(() => {
      if (fallbackTimer != null) {
        clearTimeout(fallbackTimer)
      }
    })

    return (): JSX.Element => (
      <div class={styles['layout-container']}>
        <div
          class={`${styles.header} animate__animated animate__slideInDown`}
          style={{ 'animation-duration': animationDuration }}
          onAnimationend={revealContent}
        >
          <img src="/apps/@ghcloud/higreen-data-viz/images/home/header.webp" style={{ width: '100%' }} alt="" />
          <div class={styles['title-value']}>数粒天盾</div>
          <span class={styles['title-subtitle']}>AI无人化智慧粮仓穿透式监管中心</span>
        </div>
        {loadContent.value && <div class={styles.contents}>{slots.default?.()}</div>}
        <img
          src="/apps/@ghcloud/higreen-data-viz/images/home/footer.webp"
          class={`${styles.footer} animate__animated animate__slideInUp`}
          style={{ 'animation-duration': animationDuration }}
          alt=""
        />
        <video
          class={styles.gif}
          src="/apps/@ghcloud/higreen-data-viz/images/overview.mp4"
          style={{ display: loadContent.value ? 'block' : 'none', width: '100%', height: '100%', objectFit: 'fill' }}
          autoplay
          muted
          loop
          playsinline
        />
      </div>
    )
  },
})
