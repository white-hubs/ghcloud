
import { computed, defineComponent } from 'vue'
import './swiper-list.less'
import { BookStatus, type BookRoomAppointmentVo } from '@ghcloud/cube-meet-room-service'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay } from 'swiper'
import 'swiper/css'
import 'swiper/css/autoplay'

interface Props {
  info: BookRoomAppointmentVo;
}
export const SwiperList = defineComponent({
  props: ['info'],
  setup (props: Props) {
    const modules = [Autoplay]
    const meetList = computed(() => {
      return (props.info.records ?? [])
    })
    const activeId = computed(() => {
      const find = meetList.value.find(e => {
        return e.bookStatus === BookStatus.BeingUsed
      })
      return find?.bookId ?? ''
    })
    return (): JSX.Element=>
      <div class='swiper-list'>
        <div class='wrap'>
          <div class='title'>今日会议（{meetList.value.length ?? 0}）</div>
          <div class='swiper-box'>
            <Swiper modules={modules} slides-per-view={3} space-between={30} autoplay={{ delay: 3000 }} speed={500}>
              {
                meetList.value.map((e, index) => {
                  return (
                    <SwiperSlide key={e.bookId ?? 0 + index}>
                      <div class={['single-line meet-item', e.bookId === activeId.value ? 'active' : '']}>
                        <div class='content'>
                          <div class='single-line time'>{e.timeInterval}</div>
                          <div class='multi-line name'>{e.conferenceTheme}</div>
                          <div class='single-line desc'>{e.userName}</div>
                        </div>
                      </div>
                    </SwiperSlide>
                  )
                })
              }
            </Swiper>
          </div>
        </div>
      </div>
  }
})
