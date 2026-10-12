import { defineComponent, watch, type PropType } from 'vue'
import { bookStatusColor, type AppointmentDetails } from './type'
import styles from './show-booking.module.less'
import dayjs from 'dayjs'

export const ShowBooking = defineComponent({
  props: {
    list: {
      type: Array as PropType<AppointmentDetails[]>,
      default: () => {
        return []
      }
    },
    id: {
      type: String,
      default: ''
    }
  },
  setup (props) {
    watch(() => props.id, () => {
      setTimeout(() => {
        // 跳转到当前时间
        const currentHour = dayjs().hour() > 9 ? String(dayjs().hour()) : '0' + dayjs().hour()
        const hours = props.list.map(x => {
          return x.timeInterval.split('-')[0].split(':')[0]
        })
        const index = hours.findIndex(x => x === currentHour)
        document.getElementById(props.id)?.scrollTo(index * 54, 0)
      })
    }, { immediate: true })
    return (): JSX.Element =>

      <>
        <div id={props.id} class={styles.wrapper}>
          {props.list.map(item =>
            <div key={item.timeInterval} class={styles.item}>
              <div class={styles.status} style={{ backgroundColor: `${bookStatusColor.get(item.bookStatus)}` }} />
              <div>{item.timeInterval.split('-')[0]}</div>
            </div>)}
        </div>
      </>
  }
})
