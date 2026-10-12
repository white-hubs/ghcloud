import { defineComponent, ref } from 'vue'
import styles from './web-view.module.less'
import { useRoute } from 'vue-router'
import { useKeyboardEsc } from '@/hooks/use-keyboard-esc'

export const WebView = defineComponent({
  setup: () => {
    const { url } = useRoute().query as { url: string; type: string; }
    const iframeUrl = ref<string>(url ?? '')
    const isLoading = ref<boolean>(true)
    const iframeRef = ref<HTMLIFrameElement | null>(null)

    const goBack = (): void => {
      iframeUrl.value = ''
      window.history.back()
    }

    const handleIframeLoad = (): void=> {
      isLoading.value = false
    }

    useKeyboardEsc(goBack)

    return (): JSX.Element => (
      <div class={styles['iframe-container']}>
        <iframe
          ref={iframeRef}
          src={iframeUrl.value}
          width="100%"
          height="100%"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            overflow: 'hidden',
            display: isLoading.value ? 'none' : 'block' // 控制显示
          }}
          frameborder="0"
          scrolling="no"
          allowfullscreen
          onLoad={handleIframeLoad} // 监听加载完成
        />
        {isLoading.value && <div class={styles.loading}></div>}
        <div class={[styles['back-btn']]} onClick={goBack}></div>
      </div>
    )
  }
})