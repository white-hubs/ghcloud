import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import styles from './log-list.module.less'
import { PullRefresh, List, Empty, Skeleton, Tabs, Tab } from 'vant'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { useRouter } from 'vue-router'
import { cubeZhongdaHeshunService } from '@/api/server'
import type { MemberLogResult } from '@ghcloud/cube-zhongda-heshun-service'
import dayjs from 'dayjs'

enum LogType {
  DeviceAlarmLog = "DEVICE_ALARM_LOG",
  DeviceWorkLog = "DEVICE_WORK_LOG",
  UserOperationLog = "USER_OPERATION_LOG",
}
/**
 * 日志列表组件
 */
export const LogList = defineComponent({
  setup: () => {
    cubeAppService.onVisibilityNativeAppBar(true)
    useMetaTitle()
    const router = useRouter()
    
    // 顶部Tab切换
    const tabOptions = ref([
      { label: '设备工作日志', value: LogType.DeviceWorkLog },
      { label: '用户操作记录', value: LogType.UserOperationLog },
      { label: '设备告警', value: LogType.DeviceAlarmLog },
    ])

    const dataSource = ref<MemberLogResult[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const skeletonLoading = ref(true)
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 20,
      logType: LogType.DeviceWorkLog
    })
    const getDataSource = async () => {
      try {
        const res = await cubeZhongdaHeshunService.getLogList({
          pageNumber: search.pageNumber,
          pageSize: search.pageSize,
          type: search.logType
        })
        res.records = res.records?.map(item => {
          return {
            ...item,
            type: search.logType,
          }
        })
        return { total: res.total, records: res.records, logType: search.logType };
      } catch {
        return { total: 0, records: [] };
      }
    }

    const onLoad = async () => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await getDataSource()
        if (res.total <= search.pageSize) {
          finished.value = true
        }
        if (res.records.length < search.pageSize) {
          finished.value = true
        }
        if (search.pageNumber === 1) {
          dataSource.value = []
        }
        dataSource.value = ([...dataSource.value, ...res.records] as MemberLogResult[])?.filter(item => item.type === search.logType)
      } catch {
        finished.value = true
      } finally {
        setTimeout(() => {
          loading.value = false
          refreshing.value = false
          skeletonLoading.value = false
        }, 1000)
      }
    }

    const onRefresh = async () => {
      search.pageNumber = 0
      finished.value = false
      await onLoad()
    }

    const getData = async () => {
      dataSource.value.length = 0
      skeletonLoading.value = true
      onRefresh()
    }

    const handleTabChange = (): void => {
      dataSource.value = []
      search.pageNumber = 0
      getData()
    }

    onMounted(() => {
      getData()
    })

    return () => (
      <div class={styles.container}>
        <div class={styles.tabs}>
          <Tabs
            v-model:active={search.logType}
            onChange={handleTabChange}
            swipeable
            animated
            sticky
          >
            {tabOptions.value.map(item => (
              <Tab class={styles.tab} title={item.label} name={item.value} key={item.value}>
              <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} class={styles['log-list-pull-refresh']}>
                {skeletonLoading.value ? (
                  new Array(3).fill('').map((item,index) => (
                    <Skeleton class={styles['skeleton-item']} title key={index} />
                  ))
                ) : (
                  <List
                    v-model:loading={loading.value}
                    v-model:finished={finished.value}
                    finished-text="没有更多了"
                    onLoad={onLoad}
                    class={styles.list}
                  >
                    {dataSource.value.length > 0 ? (
                      <div class={styles['log-list']}>
                        {dataSource.value.map((item, index) => {
                          if (search.logType === 'DEVICE_WORK_LOG') {
                            return (
                              <div class={styles['log-item']} key={item.id || index}>
                                <div class={styles['log-item-header']}>
                                  <span class={styles['log-item-name']}>{item.title}</span>
                                  <span class={styles['log-item-time']}>{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
                                </div>
                                <div class={styles['log-item-content']}>
                                  <span class={styles['log-item-operation']}>{item.detail}</span>
                                  {/* <span class={styles['log-item-duration']}>{item.duration}</span> */}
                                </div>
                              </div>
                            )
                          } else if (search.logType === 'USER_OPERATION_LOG') {
                            return (
                              <div class={styles['log-item']} key={item.id || index}>
                                <div class={styles['log-item-header']}>
                                  <span class={styles['log-item-name']}>{item.title}</span>
                                  <span class={styles['log-item-time']}>{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
                                </div>
                                <div class={styles['log-item-content']}>
                                  <span class={styles['log-item-operation']}>{item.detail}</span>
                                </div>
                              </div>
                            )
                          } else if (search.logType === 'DEVICE_ALARM_LOG') {
                            return (
                              <div class={styles['log-item']} key={item.id || index}>
                                <div class={styles['log-item-header']}>
                                  <span class={styles['log-item-name']}>{item.title}</span>
                                  <span class={styles['log-item-time']}>{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm:ss') : ''}</span>
                                </div>
                                <div class={styles['log-item-content']}>
                                  <span class={styles['log-item-operation']}>{item.detail}</span>
                                </div>
                              </div>
                            )
                          }
                        })}
                      </div>
                    ) : (
                      <Empty description="暂无数据" />
                    )}
                  </List>
                )}
              </PullRefresh>
              </Tab>
            ))}
          </Tabs>
        </div>

        {/* <BottomTabBar /> */}
      </div>
    )
  }
})