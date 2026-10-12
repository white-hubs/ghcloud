
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import './meet-info.less'
import dayjs from 'dayjs'
import { BookStatus, type BookRoomAppointmentVo } from '@ghcloud/cube-meet-room-service'

interface Props {
  info: BookRoomAppointmentVo;
}
/** 当前会议室详情 */
export const MeetInfo = defineComponent({
  props: ['info'],
  emits: ['current'],
  setup (props: Props, { emit }) {

    const dateTime = ref(dayjs().format('HH:mm'))
    let timer: number | NodeJS.Timeout | null | undefined = null
    onMounted(() => {
      timer = setInterval(() => {
        dateTime.value = dayjs().format('HH:mm')
      }, 1000)
    })
    onBeforeUnmount(() => {
      timer && window.clearInterval(timer)
    })
    // [BookStatus.BeingUsed, '会议中'] 空闲
    const curInfo = computed(() => {
      const find = (props.info.records ?? []).find(e => {
        return e.bookStatus === BookStatus.BeingUsed
      })
      emit('current', find)
      return find
    })

    return (): JSX.Element =>
      <div class='meet-info'>
        <div class='wrap'>
          <div class='time'>{curInfo.value?.timeInterval}</div>
          <div class='theme'>
            <span>{curInfo.value?.bookStatus === BookStatus.BeingUsed ? '使用中' : '空闲'}</span>
          </div>
          <div class='sub-theme'>{curInfo.value?.deptName}{curInfo.value?.conferenceType}</div>
          <div class='name'>{curInfo.value?.userName}</div>
        </div>
      </div>
  }
})
