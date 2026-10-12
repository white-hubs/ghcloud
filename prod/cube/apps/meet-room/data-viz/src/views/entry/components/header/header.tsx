import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import './header.less'
import dayjs from 'dayjs'
import type { BookRoomAppointmentVo } from '@ghcloud/cube-meet-room-service'

interface Props {
  info: BookRoomAppointmentVo;
}
/** 入口页头部 */
export const EntryHeader = defineComponent({
  props: ['info'],
  setup (props: Props) {
    const dateTime = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
    let timer: number | NodeJS.Timeout | null | undefined = null
    onMounted(() => {
      timer = setInterval(() => {
        dateTime.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
      }, 1000)
    })
    onBeforeUnmount(() => {
      timer && window.clearInterval(timer)
    })

    return (): JSX.Element =>
      <div class='entry-header'>
        <div class='title'>{props.info.conferenceName ?? '多媒体会议室'}</div>
        <div class='time-area'>
          <div class='m2'>
            <span class='label'>{dayjs(dateTime.value).format('HH:mm:ss')}</span>
          </div>
          <div class='m1'>
            <span class='label mr-5'>{dayjs(dateTime.value).format('YYYY年MM月DD日')}</span>
            <span class='label'>{dayjs(dateTime.value).format('dddd')}</span>
          </div>
        </div>
      </div>
  }
})
