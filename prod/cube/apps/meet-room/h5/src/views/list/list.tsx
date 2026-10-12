import { defineComponent, onMounted, reactive, ref } from 'vue'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { Cell, CellGroup, Empty, PullRefresh, List, Button } from 'vant'
import styles from './list.module.less'
import { dayList, timeFormat } from '@/utils'
import { cubeMeetRoomService } from '@/api/server'
import { DateTabs } from '@/components/date-tabs/date-tabs'
import { ShowBooking } from '@/components/show-booking/show-booking'
import { useRouter } from 'vue-router'
import { cubeAppService, cubeWxService } from '@ghcloud/cube-app-js-sdk'
interface AppointmentType {
  areaName: string;
  name: string;
  capacity: number;
  conferenceBookStatus: string;
  conferenceId: string;
  appointmentDetails: { timeInterval: string;conferenceId: string; bookId: string; bookStatus: string; }[];
}
export const MeetRoomList = defineComponent({
  setup () {
    cubeAppService.onVisibilityNativeAppBar(true)
    useMetaTitle()
    const month = ref('')
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const dates = ref<{ day: string; week: string;value: string; }[]>([])
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      date: ''
    })
    const router = useRouter()
    const dataSource = ref<AppointmentType[]>([])
    month.value = timeFormat(null, 'yyyy-MM') ?? ''
    dates.value = dayList(month.value)

    // 获取预约列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeMeetRoomService.getAppointment({ ...search })
        search.total = res.total
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (!dataSource.value) {
          dataSource.value = []
        }
        if (search.pageNumber === 1) {
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
    const onSearch = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    const checkedDate = async (val: string): Promise<void> => {
      search.date = val
      onSearch()
    }
    const toDetail = (item: AppointmentType): void => {
      router.push({ path: '/detail', query: { id: item.conferenceId } })
    }
    const isWxMini = ref(false)
    onMounted(async () => {
      isWxMini.value = await cubeWxService.getWxEnv()
    })
    return (): JSX.Element =>
      <>
        <DateTabs onChecked={(val) => {
          checkedDate(val)
        }}>
          <div class={styles.container}>
            <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '90vh', overflow: 'auto' }}>
              <List
                v-model:loading={loading.value}
                finished={finished.value}
                finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
                onLoad={onLoad}
              >
                {
                  dataSource.value && dataSource.value.length > 0 &&
                  dataSource.value.map((item) => {
                    return (
                      <CellGroup inset class={styles['cell-group']} key={item}>
                        <Cell>
                          <div class={styles['cell-title']}>
                            <div class={styles['name-status']}>
                              <span class={styles.name}>{item.name || '--'}</span>
                            </div>
                          </div>
                        </Cell>
                        <Cell class={styles.cell} onClick={() => {
                          toDetail(item)
                        }}>
                          <div class={styles['cell-item']}>
                            <label>可容纳人数：</label>
                            <span>{item.capacity || '--'}</span>
                          </div>
                          <div class={styles['cell-item']}>
                            <label>会议室地址：</label>
                            <span>{item.areaName || '--'}</span>
                          </div>
                          <div class={styles['booking-cell-item']} style={{ flexDirection: 'column' }}>
                            <label>可预约时间：</label>
                            <div><ShowBooking list={item.appointmentDetails} id={item.conferenceId} /></div>
                          </div>
                          <div>
                            <Button v-show={item.conferenceBookStatus === 'AVALIABLE'} type='primary' size='small' style={{ width: '60px' }}>预约</Button>
                          </div>
                          <div v-show={item.conferenceBookStatus === 'NOAPPOINTMENT'} class={styles.fill}>已约满</div>
                        </Cell>
                      </CellGroup>
                    )
                  })
                }
                {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
              </List>
            </PullRefresh>
            {isWxMini.value && <div class={styles.booking} onClick={() => {
              router.push({ path: '/myReservationMeeting' })
            }}><p>我的预约</p></div>}
          </div>
        </DateTabs>
      </>
  }
})
