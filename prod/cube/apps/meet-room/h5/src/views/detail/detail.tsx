import { defineComponent, reactive, ref } from 'vue'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { Cell, CellGroup, Empty, PullRefresh, List, Tag, Button } from 'vant'
import styles from './detail.module.less'
import { dayList, timeFormat } from '@/utils'
import { cubeMeetRoomService } from '@/api/server'
import { DateTabs } from '@/components/date-tabs/date-tabs'
import { useRoute, useRouter } from 'vue-router'
import { bookStatus, bookStatusBackColor, bookStatusColor } from './type'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
interface AppointmentType {
  conferenceTheme: string;
  timeInterval: string;
  conferenceType: number;
  userName: string;
  deptName: string;
  bookStatus: string;
  bookNum: number;
  bookId: string;
}
export const Detail = defineComponent({
  setup () {
    useMetaTitle()
    cubeAppService.onVisibilityNativeAppBar(true)
    const month = ref('')
    const refreshing = ref(false)
    const loading = ref(false)
    const finished = ref(false)
    const dates = ref<{ day: string; week: string;value: string; }[]>([])
    const search = reactive({
      conferenceId: '',
      date: ''
    })
    const router = useRouter()
    const route = useRoute()
    search.conferenceId = route.query.id as string
    const dataSource = ref<{ capacity: number; areaName: string;records: AppointmentType[]; }>()
    month.value = timeFormat(null, 'yyyy-MM') ?? ''
    dates.value = dayList(month.value)

    // app会议室预约列表
    const onLoad = async (): Promise<void> => {
      try {
        finished.value = false
        const res = await cubeMeetRoomService.getAppointmentInfo({ ...search })
        dataSource.value = res
      } catch {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
        finished.value = true
      }
    }
    const toForm = (item: AppointmentType): void => {
      router.push({ path: '/reservation-detail', query: { bookId: item.bookId } })
    }
    const checkedDate = async (val: string): Promise<void> => {
      search.date = val
      onLoad()
    }
    return (): JSX.Element =>
      <>
        <DateTabs onChecked={(val) => {
          checkedDate(val)
        }}>
          <CellGroup inset class={styles['cell-group']}>
            <Cell>
              <div class={styles['cell-title']}>
                <div class={styles['name-status']}>
                  <span class={styles.name}>基本信息</span>
                </div>
              </div>
            </Cell>
            <Cell class={styles.cell}>
              <div class={styles['cell-item']}>
                <label>可容纳人数：</label>
                <span>{dataSource.value?.capacity || '--'}</span>
              </div>
              <div class={styles['cell-item']}>
                <label>地址：</label>
                <span>{dataSource.value?.areaName || '--'}</span>
              </div>
            </Cell>
          </CellGroup>
          <div class={styles.message}>
            <div>预约信息</div>
            <div class={styles['message-status']}>
              <span>已结束</span>
              <span>会议中</span>
              <span>已预约</span>
              <span>预约中</span>
            </div>
          </div>
          <PullRefresh v-model={refreshing.value} onRefresh={onLoad} style={{ height: '59vh', overflow: 'auto' }}>
            <List
              v-model:loading={loading.value}
              finished={finished.value}
              finished-text={dataSource.value?.records.length === 0 ? '' : '暂无更多数据'}
            >
              {
                dataSource.value?.records.map((item) => {
                  return (
                    <CellGroup inset class={styles['cell-group']} key={item}>
                      <Cell>
                        <div class={styles['item-title']}>
                          <span>{item.timeInterval}</span>
                          <span>
                            <Tag
                              style={{ height: '22px', borderRadius: '4px' }}
                              color={bookStatusBackColor.get(item.bookStatus)}
                              text-color={bookStatusColor.get(item.bookStatus)}
                            >{bookStatus.get(item.bookStatus)}
                            </Tag>
                          </span>
                        </div>
                      </Cell>
                      <Cell class={styles.cell} onClick={() => {
                        toForm(item)
                      }}>
                        <div class={styles['cell-title']}>
                          <div class={styles['name-status']}>
                            <span class={styles.name}>{item.conferenceTheme || '--'}</span>
                          </div>
                        </div>
                        <div class={styles['cell-item']}>
                          {item.conferenceType && <Tag plain color='#C6C6C6' style={{ height: '22px', borderRadius: '4px', marginRight: '5px' }} text-color='#999999'>{item.conferenceType}</Tag>}
                          <Tag plain color='#C6C6C6' style={{ height: '22px', borderRadius: '4px' }} text-color='#999999'>{item.bookNum}人参会</Tag>
                        </div>
                      </Cell>
                      <div class={styles['item-user']} style={{ background: `linear-gradient(90deg, ${bookStatusBackColor.get(item.bookStatus)}, #ffffff)` }}>
                        <div class={styles.user}>
                          <span>{item.userName.split('')[0]}</span>
                          <span>{item.userName}</span>
                        </div>
                        <span>{item.deptName}</span>
                      </div>
                    </CellGroup>
                  )
                })
              }
              {(dataSource.value?.records.length === 0) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
          <Button type='primary' block onClick={() => {
            router.push({ path: '/reservation', query: { search: JSON.stringify(search) } })
          }}>去预约</Button>
        </DateTabs>
      </>
  }
})
