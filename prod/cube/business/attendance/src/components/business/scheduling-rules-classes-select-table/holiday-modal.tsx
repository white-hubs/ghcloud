import { Calendar, Modal } from '@ghcloud/cube-ui'
import { computed, defineComponent, onMounted, ref, watch, type VNode } from 'vue'
import dayjs from 'dayjs'
import { getHolidayApi } from '@/api/staff-clock-in'

interface Props {
  show: boolean;
}
interface DayJsItem {
  date: () => number;
  month: () => number;
}

export const HolidayModal = defineComponent({
  props: ['show'],
  emits: ['update:show'],
  setup: (props: Props, { emit }) => {
    const show = ref(props.show ?? false)
    watch(() => props.show, () => {
      show.value = props.show
    })
    const date = ref(dayjs())
    watch(() => date.value.format('YYYY-MM-DD'), () => {
      getData()
    })

    const monthData = ref<{ year: number; month: number; day: number; isHoliday: boolean; }[]>([])
    const getData = async (): Promise<void> => {
      const year = date.value.year()
      const month = date.value.month() + 1
      const res = await getHolidayApi(year, month)
      monthData.value = res.data[0].almanac.map(e => {
        const item = e as unknown as { year: string; month: string; day: string; status?: string; }
        return {
          year: parseInt(item.year),
          month: parseInt(item.month),
          day: parseInt(item.day),
          isHoliday: item.status === '1',
        }
      })
    }

    const isHoliday = computed(() => {
      return (current: DayJsItem): string => {
        const month = current.month() + 1
        const day = current.date()
        const item = monthData.value.find(e => e.month === month && e.day === day && e.isHoliday)
        if (item) {
          return '节假日'
        }
        return ''
      }
    })

    onMounted(() => {
      getData()
    })

    const slots = {
      dateCellRender: ({ current }: { current: DayJsItem; }): VNode => {
        return (
          <>
            {isHoliday.value(current)}
          </>
        )
      }
    }
    return (): VNode =>
      <Modal destroyOnClose v-model:visible={show.value} title='法定节假日' footer={null} onUpdate:visible={() => {
        emit('update:show', show.value)
      }}>
        <Calendar v-model:value={date.value} v-slots={slots} />
      </Modal>
  }
})
