import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'
import '@/assets/style.less'

export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls='message-center'>
        <RouterView />
      </ConfigProvider>
    )
  }
})
