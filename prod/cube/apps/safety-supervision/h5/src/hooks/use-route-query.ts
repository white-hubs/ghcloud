import dayjs from 'dayjs'
import { onMounted, ref, type Ref } from 'vue'
import { useRoute } from 'vue-router'
type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
interface State {
  period: Ref<string>;
  timeType: Ref<SelectType>;
}
export const useRouteQuery = (): State => {
  const period = ref<string>(`${dayjs().startOf('month').format('YYYY-MM-DD 00:00')},${dayjs().format('YYYY-MM-DD HH:mm')}`)
  const route = useRoute()
  const timeType = ref<SelectType>('THIS_MONTH')

  onMounted(() => {
    period.value = (route.query as { period: string; }).period || `${dayjs().startOf('month').format('YYYY-MM-DD 00:00')},${dayjs().format('YYYY-MM-DD HH:mm')}`
    timeType.value = (route.query as { timeType: SelectType; }).timeType || 'THIS_MONTH'
  })
  return {
    period,
    timeType
  }
}
