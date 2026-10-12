import { defineComponent } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider } from 'ant-design-vue'

export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => {
      return (
      <ConfigProvider prefixCls='cube-admin-app'>
        <RouterView />
      </ConfigProvider>
    )}
  }
})
