import { defineComponent, onBeforeMount, reactive } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
export const App = defineComponent({
  setup: () => {
    onBeforeMount(() => {
      loadTMap()
    })
    const state = reactive({
      loadedMap: false
    })
    const loadTMap = (): void => {
      const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = 'https://map.qq.com/api/gljs?v=1.exp&key=6MDBZ-26PK7-WWIXV-H3SDL-JMTLK-S5FOW'
      document.body.appendChild(script)
      script.onload = (): void => {
        state.loadedMap = true
      }
    }
    return (): JSX.Element => (
      <ConfigProvider prefixCls='electronic-guide'>
        {state.loadedMap && <RouterView />}
      </ConfigProvider>
    )
  }
})
