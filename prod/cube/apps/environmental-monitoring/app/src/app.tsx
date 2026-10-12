import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
export const App = defineComponent({
  setup: () => {
    return () => (
      <ConfigProvider prefixCls='environmental-monitoring'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
