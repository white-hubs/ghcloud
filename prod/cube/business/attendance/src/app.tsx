import { defineComponent, type VNode } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
export const App = defineComponent({
  setup: () => {
    return (): VNode=> (
      <ConfigProvider prefixCls='attendance'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
