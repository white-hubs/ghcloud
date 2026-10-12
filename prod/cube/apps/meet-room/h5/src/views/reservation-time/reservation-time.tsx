import { defineComponent, onMounted, reactive } from 'vue'
import { Button, Empty, Icon, Loading, showNotify } from 'vant'
import './reservation-time.less'
import { useRoute, useRouter } from 'vue-router'
import { cubeMeetRoomService } from '@/api/server'
import { Legend } from '@/components/legend/legend'
import type { AppointmentDetailState, AppointmentDetailsVo } from '@ghcloud/cube-meet-room-service'
import { storeMeet } from '@/store/meet'
export const ReservationTime = defineComponent({
  setup: () => {
    const route = useRoute()
    const router = useRouter()
    const search = JSON.parse(route.query.search as string)
    const meetStore = storeMeet()
    const activeTimeList = search.activeTime ? search.activeTime.split(',') : []

    const state = reactive<{
      loading: boolean;
      conferenceTypeOptions: { text: string;value: string; }[];
      timeList: AppointmentDetailsVo[];
      timeTitleList: string[];
      detail: AppointmentDetailState | null;
    }>({
      loading: false,
      conferenceTypeOptions: [],
      timeList: [],
      timeTitleList: [],
      detail: null
    })
    const showTime = (): void => {
      state.timeList = []
      if (state.detail?.appointmentDetails && state.detail?.appointmentDetails?.length > 0) {
        state.timeList = state.detail?.appointmentDetails.map((item) => {
          item.active = activeTimeList.includes(item?.timeInterval)
          return item
        })
      }

      state.timeTitleList = state.timeList.map((item, index) => {
        if (index % 4 === 0) {
          const time = item?.timeInterval?.split('-')[0]
          return `${time}`
        }
      }).filter(i => i) as string[]
    }
    const getConferenceTimes = async (): Promise<void> => {
      try {
        state.loading = true
        const result = await cubeMeetRoomService.getAppAppointmentDetail({
          conferenceId: search.conferenceId,
          date: search.date
        })
        state.detail = result
        showTime()
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        state.loading = false
      }
    }

    const statusTypeMap = [
      { key: 'APPROVAL', label: '预约中', name: 'approval' },
      { key: 'RESERVED', label: '已预约', name: 'reserved' },
      { key: 'RESERVABLE', label: '空闲中', name: 'reservable' },
      { key: 'BEING_USED', label: '使用中', name: 'used' },
      { key: 'EXPIRE', label: '不可预约', name: 'noReservable' },
      { key: 'CANCEL_RESERVATION', label: '不可预约', name: 'noReservable' },
      { key: 'NO_RESERVABLE', label: '不可预约', name: 'noReservable' },
    ]
    const getStatusName = (status: string): string => {
      const item = statusTypeMap.find(i => i.key === status)
      return item?.name ?? ''
    }
    const handleTime = (item: AppointmentDetailsVo): void => {

      if (item.bookStatus === 'RESERVABLE') {
        item.active = !item.active
      }
    }
    const handleEnter = async (): Promise<void> => {
      meetStore.reservationTime = state.timeList
      router.back()
    }
    onMounted(() => {
      if (meetStore.reservationTime && state.timeList.length) {
        state.timeList = meetStore.reservationTime ?? []
      } else {
        getConferenceTimes()
      }
    })
    return (): JSX.Element => (
      <div class='container'>
        <Legend />
        <div class='form'>
          {state.loading && <Loading type='spinner' size='24px' vertical style='margin-top:100px'>加载中...</Loading>}
          {
            state.conferenceTypeOptions
              ? <div class='time'>
                <div class='time-list'>
                  {
                    state.timeList.map((item, index) => {
                      return (
                        <div key={index} class={['time-item', item.active ? 'active' : '', getStatusName(item?.bookStatus ?? '')]} onClick={() => {
                          handleTime(item)
                        }}>
                          {item.active ? <div class='select'><Icon name='success' /></div> : ''}
                          <div class='cell'>
                            <div class='cell-title'>{item?.timeInterval}</div>
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
                <div class='time-line'>
                  <div class='time-line-time'>
                    {
                      state.timeTitleList.map((item, index) => {
                        return (
                          <div key={index} class='time-line-title'>
                            <span class='time-line-title-text'>{item}</span>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
              : <Empty description='暂无预约时间' />
          }
        </div>
        <div class='footer'>
          <Button block type='primary' onClick={handleEnter}>确定</Button>
        </div>
      </div>
    )
  }
})
