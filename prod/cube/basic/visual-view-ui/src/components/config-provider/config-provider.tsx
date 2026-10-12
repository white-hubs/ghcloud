import { defineComponent } from 'vue'
import { NConfigProvider,type ConfigProviderProps, } from "naive-ui";
import { zhCN, dateZhCN } from 'naive-ui'
import { darkTheme } from 'naive-ui'
import 'dayjs/locale/zh-cn'
import dayjs from 'dayjs'
dayjs.locale('zh-cn')
export default defineComponent({
  props: {
    clsPrefix:{
      type:String as StringConstructor,
      default:'n'
    },
  },
  setup (props: ConfigProviderProps, { slots }) {
    return () => <NConfigProvider {...props} clsPrefix={props.clsPrefix ?? 'n'} theme={darkTheme} locale={zhCN} date-locale={dateZhCN}>{slots}</NConfigProvider>
  }
})
