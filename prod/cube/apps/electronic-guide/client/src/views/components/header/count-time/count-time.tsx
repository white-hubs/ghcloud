import { computed, defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import dayjs from 'dayjs'
export const CountTime = defineComponent({
  setup: () => {
    const weekDay = ['日', '一', '二', '三', '四', '五', '六']
    const state = reactive({
      time: dayjs(new Date()).format('HH:mm:ss'),
      date: dayjs(new Date()).format('YYYY-MM-DD'),
      day: dayjs().day()
    })
    const getDay = computed(() => {
      return weekDay[dayjs(state.date).day()]
    })
    const formatDateTime = (): {
      time: string;
      date: string;
    } => {
      const date = new Date()
      const dateTime = {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds()
      }

      // 确保月份、日期、小时、分、秒都是两位数
      const formattedTime = [
        String(dateTime.hours).padStart(2, '0'),
        String(dateTime.minutes).padStart(2, '0'),
        String(dateTime.seconds).padStart(2, '0')
      ].join(':')
      const formattedDate = [
        dateTime.year,
        String(dateTime.month).padStart(2, '0'),
        String(dateTime.day).padStart(2, '0'),
      ].join('-')

      return {
        time: formattedTime,
        date: formattedDate
      }
    }
    const startCountTime = (): void => {
      const { time, date } = formatDateTime()
      state.time = time
      state.date = date
    }
    onMounted(() => {
      setInterval(() => {
        startCountTime()
      }, 1000)
    })
    return (): JSX.Element => (
      <div class={styles.container}>
        <div>
          星期{getDay.value}
        </div>
        <div style={{ marginLeft: '12px' }}>
          {state.date}
        </div>
        <div>
          {state.time}
        </div>
      </div>
    )
  }
})
