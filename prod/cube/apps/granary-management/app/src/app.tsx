import { ConfigProvider } from '@ghcloud/cube-ui'
import { ConfigProvider as AntConfigProvider } from 'ant-design-vue/es'
import { qiankunWindow } from 'vite-plugin-qiankun/dist/helper'
import { computed, defineComponent, onUnmounted, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import './app-shell.less'
import 'swiper/css'
import 'swiper/css/effect-coverflow'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const GRANARY_FULL_WINDOW_BODY_CLASS = 'granary-management-full-window-active'

const getGranaryPopupContainer = (triggerNode: HTMLElement): HTMLElement => {
  const root = document.getElementById('cube-granary-management-app')
  return root ?? triggerNode.parentElement ?? document.body
}

export const App = defineComponent({
  setup: () => {
    const route = useRoute()
    /** qiankun 内由宿主收起顶栏/侧栏；独立打开时用 fixed（与 meta.isFullWindow 一致） */
    const useFixedFullWindow = computed(
      (): boolean => route.meta.isFullWindow === true && !qiankunWindow.__POWERED_BY_QIANKUN__,
    )
    const shellClass = computed((): string =>
      [
        'granary-management-app-shell',
        useFixedFullWindow.value === true ? 'granary-management-app-shell--full-window' : '',
      ]
        .filter((s) => s.length > 0)
        .join(' '),
    )

    watch(
      () => useFixedFullWindow.value === true,
      (immersive) => {
        if (immersive) {
          document.body.classList.add(GRANARY_FULL_WINDOW_BODY_CLASS)
        } else {
          document.body.classList.remove(GRANARY_FULL_WINDOW_BODY_CLASS)
        }
      },
      { immediate: true },
    )

    onUnmounted(() => {
      document.body.classList.remove(GRANARY_FULL_WINDOW_BODY_CLASS)
    })

    return (): JSX.Element => (
      <ConfigProvider prefixCls='cube-granary-management-app'>
        <AntConfigProvider getPopupContainer={getGranaryPopupContainer}>
          <div class={shellClass.value}>
            {/* meta.isFullWindow 且非 qiankun：见 app-shell.less；qiankun 下由宿主让出布局 */}
            <div class='granary-management-router'>
              <RouterView />
            </div>
          </div>
        </AntConfigProvider>
      </ConfigProvider>
    )
  },
})
