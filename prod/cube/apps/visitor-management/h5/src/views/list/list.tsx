import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { Empty, List, Button, Tab, Tabs, showNotify } from 'vant'
import styles from './list.module.less'
import { dayList, timeFormat } from '@/utils'
import { cubeVisitorManagementService } from '@/api/server'
import { DateTabs } from '@/components/date-tabs/date-tabs'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'

export const BookingList = defineComponent({
  setup () {
    useMetaTitle()
    const month = ref('')
    const loading = ref(false)
    const finished = ref(false)
    const dates = ref<{ day: string; week: string;value: string; }[]>([])
    const areaTabs = ref<{ id: number | string; name: string; }[]>([])
    const search = reactive({
      areaId: '',
      id: '',
      period: '',
      areaName: ''
    })
    const router = useRouter()
    const dataSource = ref()

    month.value = timeFormat(null, 'yyyy-MM') ?? ''
    dates.value = dayList(month.value)
    // 获取预约列表
    const getBookingData = async (): Promise<void> => {
      try {
        loading.value = true
        finished.value = false
        dataSource.value = []
        if (search.areaId) {
          const res = await cubeVisitorManagementService.getPeriodDetail({ ...search })
          dataSource.value = res.detailList[0]?.timeList ?? []
          search.areaName = res.detailList[0]?.areaName ?? ''
        }
      } catch {
      } finally {
        loading.value = false
        finished.value = true
      }
    }
    const isBooking = (item: { timeStr: string;remainNumber: number; }): boolean => {
      const currentDate = search.period.split(',')[0]
      const end = item.timeStr.split('-')[1]
      const endTime = new Date(`${currentDate} ${end}`).getTime()
      const current = new Date().getTime()
      const now = dayjs()
      const sevenDaysLater = now.add(7, 'day')
      // 检查日期是否在未来7天内
      const isSevenDays = (
        dayjs(currentDate).isBefore(sevenDaysLater, 'day') ||
        (dayjs(currentDate).isSame(sevenDaysLater, 'day') && dayjs(currentDate).isAfter(now))
      )
      if (current >= endTime || !isSevenDays || item.remainNumber === 0 || item.remainNumber === null || item.remainNumber === undefined) {
        return false
      }
      return true
    }
    // 获取区域
    const getVisitorArea = async (): Promise<void> => {
      try {
        areaTabs.value = await cubeVisitorManagementService.getVisitorArea()
        search.areaId = areaTabs.value[0].id as string ?? ''
      } catch (error) {
        const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      } finally {
        dataSource.value = []
      }
    }
    watch(() => search.areaId, () => {
      getBookingData()
    })
    const checkedDate = async (val: string): Promise<void> => {
      search.period = `${val},${val} 23:59:59`
      getBookingData()
    }
    onMounted(() => {
      getVisitorArea()
    })
    return (): JSX.Element =>
      <>
        <DateTabs onChecked={(val) => {
          checkedDate(val)
        }}>
          <div class={styles.container}>
            <Tabs
              v-model:active={search.areaId} shrink
            >
              {
                areaTabs.value?.length === 0 && <Empty description='暂无数据' />
              }
              {
                areaTabs.value && areaTabs.value.length > 0 && areaTabs.value.map((item: { id: string | number; name: string; }) =>
                  <Tab key={item.id} name={item.id} title={item.name}>
                    <div style={{ padding: '20px 10px', overflow: 'auto', height: '78vh' }}>
                      <List
                        v-model:loading={loading.value}
                        finished={finished.value}
                        finished-text={dataSource.value?.length === 0 ? '' : '暂无更多数据'}
                      >
                        {
                          dataSource.value && dataSource.value.length > 0 &&
                      dataSource.value.map((item: { timeStr: string;remainNumber: number;id: string; }, index: string | number | symbol) => {
                        return (
                          <div key={index} class={styles.cell}>
                            <div class={styles['cell-item']}>
                              <div>{item.timeStr}</div>
                              <div>{!isBooking(item) ? '停止预约' : `余：${item.remainNumber ?? 0}`}</div>
                            </div>
                            <div>
                              <Button
                                v-show={isBooking(item)}
                                color='#E7F1FF' size='small'
                                style={{ color: '#1578FF', width: '60px' }}
                                onClick={() => {
                                  router.push({
                                    path: '/add-booking',
                                    query: { timeList: JSON.stringify(dataSource.value), areaId: search.areaId, areaName: search.areaName, period: search.period, time: item.timeStr, timeId: item.id }
                                  })
                                }}
                              >去预约
                              </Button>
                            </div>
                          </div>
                        )
                      })
                        }
                        {dataSource.value?.length === 0 && <Empty description='暂无数据' />}
                      </List>
                    </div>
                  </Tab>)
              }
            </Tabs>
            <div class={styles.booking} onClick={() => {
              router.push({ path: '/my-booking' })
            }}><p>我的预约</p></div>
          </div>
        </DateTabs>
      </>
  }
})
