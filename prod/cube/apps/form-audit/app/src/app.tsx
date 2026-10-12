import { defineComponent, h, type VNode } from 'vue'
import { RouterView, type RouteLocationNormalizedLoaded } from 'vue-router'
import { ConfigProvider } from '@ghcloud/cube-ui'

export const App = defineComponent({
  setup: () => {
    return (): JSX.Element => (
      <ConfigProvider prefixCls='cube-form-audit-app'>
        <RouterView
          v-slots={{
            default: ({ Component, route }: { Component: unknown; route: RouteLocationNormalizedLoaded }): VNode =>
              h(Component as never, { key: route.name ?? route.path }),
          }}
        />
      </ConfigProvider>
    )
  },
})
