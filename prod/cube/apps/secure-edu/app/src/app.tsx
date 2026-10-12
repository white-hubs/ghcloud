import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls='secure-edu'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
