import { defineComponent } from 'vue'
import { ConfigProvider, type ConfigProviderProps } from 'ant-design-vue/es'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'

dayjs.locale('zh-cn')

export default defineComponent({
  name: 'CubeConfigProvider',
  props: {
    prefixCls: String,
    locale: Object as () => ConfigProviderProps['locale'],
    theme: Object as () => ConfigProviderProps['theme'],
  },
  setup (props, { slots }) {
    return (): JSX.Element => {
      const prefixCls = props.prefixCls ?? 'cube'
      ConfigProvider.config({
        prefixCls,
      })
      const locale = props.locale ?? zhCN
      const theme = props.theme
      return (
        <ConfigProvider
          prefixCls={prefixCls}
          locale={locale}
          {...(theme !== undefined ? { theme } : {})}
        >
          {slots.default?.()}
        </ConfigProvider>
      )
    }
  },
})
