import { defineComponent, onMounted, reactive, ref } from 'vue'
import { PullRefresh, List, Empty, CellGroup, Tag, Button } from 'vant'
import { useRouter } from 'vue-router'
import './my-reservation.less'
import type { MyAppointment } from '@ghcloud/cube-meet-room-service'
import { cubeMeetRoomService } from '@/api/server'
import dayjs from 'dayjs'
import { cubeAppService, cubeWxService } from '@ghcloud/cube-app-js-sdk'
import { Bar } from '@/components/bar/bar'
import { CancelReason } from '@/components/cancel-reason/cancel-reason'

export const MyReservation = defineComponent({
  setup () {
    cubeAppService.onVisibilityNativeAppBar(false)
    const router = useRouter()
    const searchParam = reactive({
      pageNumber: 0,
      pageSize: 10
    })
    const cancelReasonRef = ref<{ openReason: (conferenceId: number | null | undefined) => void; }>()
    const refreshing = ref(false)
    const finished = ref(false)
    const loading = ref(false)
    const dataSource = ref<MyAppointment[]>([])
    const statusTypeMap = [
      { key: 'EXPIRE', label: '已过期', name: 'tag-cancel' },
      { key: 'FINISH', label: '已完成', name: 'tag-cancel' },
      { key: 'CANCEL_RESERVATION', label: '已取消', name: 'tag-cancel' },
      { key: 'RESERVED', label: '已预约', name: 'tag-reserve' },
      { key: 'APPROVAL', label: '预约中', name: 'tag-approval' },
    ]
    const getStatus = (status: string): { label: string; name: string; } | undefined => {
      return statusTypeMap.find(i => i.key === status)
    }
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        searchParam.pageNumber++
        const params = { ...searchParam }
        const res = await cubeMeetRoomService.getMyAppointment(params)
        if (searchParam.pageNumber >= res.pages) {
          finished.value = true
        }
        if (searchParam.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = [...dataSource.value, ...res.records]
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }
    const onRefresh = (): void => {
      searchParam.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const isWxMini = ref(false)
    onMounted(async () => {
      document.title = '我的预约'
      dataSource.value.length = 0
      isWxMini.value = await cubeWxService.getWxEnv()
    })
    const handleCancel = async (): Promise<void> => {
      onRefresh()
    }
    const goDetail = (event: { target: { tagName: string;className: string; }; }, e: MyAppointment): void => {
      if (!['BUTTON'].includes(event.target?.tagName) && !['cancel-button'].includes(event.target?.className)) {
        router.push({ path: '/detail', query: { id: e.conferenceId } })
      }
    }
    return (): JSX.Element =>
      <div class='list-page'>
        {!isWxMini.value && <Bar rightSlot={{ icon: '预约' }} onClick={() => {
          router.push({ path: '/conferenceRoomList' })
        }} />}
        <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
          <List
            v-model:loading={loading.value}
            finished={finished.value}
            finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
            onLoad={onLoad}
          >
            {
              (dataSource.value && dataSource.value.length > 0) &&
              dataSource.value.map(e => {
                return (
                  <CellGroup inset key={e.id} class='list-item'>
                    <div class='van-cell card-body' onClick={(event) => {
                      goDetail(event as unknown as { target: HTMLElement; }, e)
                    }}>
                      <div class='right'>
                        <div class='item title'>
                          <div class='name'>
                            <Tag
                              style={{ height: '22px', borderRadius: '4px', marginRight: '6px' }}
                              class={getStatus(e.status ?? '')?.name}
                            >
                              {getStatus(e.status ?? '')?.label}
                            </Tag>
                            {e.conferenceName ?? '--'}
                          </div>
                        </div>
                        <div class='item'>预约日期：{e.appointmentDate ? dayjs(e.appointmentDate).format('YYYY-MM-DD HH:mm:ss') : ''}</div>
                        <div class='item'>预约时间段：{e.timeInterval}</div>
                        {

                          e?.status && !['EXPIRE','CANCEL_RESERVATION', 'FINISH'].includes(e?.status)
                            ? (
                              <div class='item right-button cancel'>
                                <Button class='cancel-button' block type='primary' onClick={() => {
                                  cancelReasonRef.value?.openReason(e.id)
                                }}>取消</Button>
                              </div>
                            )
                            : null
                        }
                      </div>
                    </div>
                  </CellGroup>
                )
              })
            }
          </List>
          {(dataSource.value?.length === 0) && <Empty description='暂无数据' />}
        </PullRefresh>
        <CancelReason onOk={handleCancel} ref={cancelReasonRef} />
      </div>
  }
})
