import { defineComponent } from 'vue'
import { Calendar as ACalendar } from 'ant-design-vue/es'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

export const Calendar = defineComponent({
  setup (props, { slots }) {
    return (): JSX.Element => <ACalendar {...props} v-slots={slots} />
  },
})
