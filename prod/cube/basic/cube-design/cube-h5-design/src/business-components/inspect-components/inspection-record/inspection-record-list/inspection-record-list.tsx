import { List, Empty, PullRefresh, Cell, CellGroup, Search, Tabs, Tab } from 'vant'
import { defineComponent, type PropType, reactive, ref, watch } from 'vue'
import styles from './inspection-record-list.module.less'
import { useRoute, useRouter } from 'vue-router'
import { timeFormat } from '../../../../utils/index'
import type { InspectRecord } from '@ghcloud/cube-daily-inspection-service'
import { type InspectionParams, StatusColor, StatusType } from '../../inspection-task/type'
import { InspectionTask } from '../../inspection-task/task'

/** 巡检台账/巡检记录列表页 */
export const InspectionRecordList = defineComponent({
  props: {
    options: {
      type: Object as PropType<{
        searchParams: InspectionParams;
        getListApi: (params?: InspectionParams) => Promise<{ page: string; records: InspectRecord[]; total: number; }>;
      }>,
      default: () => {
        return {}
      }
    },
  },
  setup: (props, { expose }) => {
    const router = useRouter()
    const route = useRoute()
    const search = reactive({
      period: '',
      result: (route.query.type as string) ?? '',
      status: '',
      targetCategory: '',
      keyword: '',
      startTime: '',
      endTime: '',
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    const tabs = ref([
      { title: '全部', status: 'ALL' },
      // { title: '待接收', status: 'ACCEPT' },
      { title: '待巡检', status: 'EXECUTING' },
      { title: '已完成', status: 'OVER' },
      { title: '已过期', status: 'EXPIRE' },
      { title: '已终止', status: 'STOP' },
    ])
    const activeTab = ref('')
    const inspectionTask = new InspectionTask<InspectRecord>({ ...props.options })
    // 切换标签
    const onClickTab = (): void => {
      search.status = activeTab.value
      if (activeTab.value === 'ALL')search.status = ''
      inspectionTask.updateSearchParams(search)
      inspectionTask.refreshData()
    }
    // 获取巡检台账列表
    const onLoad = async (): Promise<void> => {
      await inspectionTask.loadData()
    }
    const onSearch = (val: InspectionParams): void => {
      Object.assign(search, { keyword: val })
      inspectionTask.updateSearchParams(search)
      inspectionTask.refreshData()
    }
    // 进入详情
    const toDetail = (item: InspectRecord): void => {
      router.push({ path: 'inspection-record-detail', query: { id: item.id } })
    }
    watch(() => props.options.searchParams, (val) => {
      if (val.startTime !== '' && val.endTime !== '') {
        search.period = (val.startTime as string) + ',' + (val.endTime as string)
      } else {
        search.startTime = ''
        search.endTime = ''
        search.period = ''
      }
      Object.assign(search, { ...val, period: search.period })
      inspectionTask.updateSearchParams(val)
    }, { deep: true, immediate: true })
    expose({
      onSearch,
    })
    return (): JSX.Element =>
      <div>
        <Search v-model={search.keyword} placeholder='根据任务名称进行搜索' onSearch={onSearch} />
        <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
          <div style={{ height: '78vh', background: '#f3f7fa' }}>
            {
              tabs.value.map(item =>
                <Tab title={item.title} name={item.status} key={item.title}>
                  <PullRefresh v-model={inspectionTask.loadingStatus.refreshing} onRefresh={() => {
                    inspectionTask.refreshData()
                  }} style={{ height: '78vh', overflow: 'auto' }}>
                    <List
                      v-model:loading={inspectionTask.loadingStatus.loading}
                      finished={inspectionTask.loadingStatus.finished}
                      finished-text={inspectionTask.dataSource.length === 0 ? '' : '暂无更多数据'}
                      onLoad={onLoad}
                    >
                      {
                        (inspectionTask.dataSource && inspectionTask.dataSource.length > 0) &&
                        inspectionTask.dataSource.map((item) => {
                          return (
                            <CellGroup inset class={styles['cell-group']} key={item.id}>
                              <Cell>
                                <div class={styles['cell-title']}>
                                  <div class={styles['name-status']}>
                                    <span class={[styles.status]} style={{ background: StatusColor.get(item.status as string) }}>{StatusType.get(item?.status as string)}</span>
                                    <span class={styles.name}>{item.targetName}</span>
                                  </div>
                                </div>
                              </Cell>
                              <Cell class={styles.cell} onClick={() => {
                                toDetail(item)
                              }}>
                                <div class={styles['cell-item']}>
                                  <label>创建时间：</label>
                                  <span>{(item?.createTime && timeFormat(item.createTime as string, true)) ?? '--'}</span>
                                </div>
                                <div class={styles['cell-item']}>
                                  <label>巡检时间：</label>
                                  <span>{(item?.time && timeFormat(item.time, true)) ?? '--'}</span>
                                </div>
                                <div class={styles['cell-item']}>
                                  <label>巡检人员：</label>
                                  <span>{item.nickname || '--'}</span>
                                </div>
                                <div class={styles['cell-item']}>
                                  <label>巡检任务：</label>
                                  <span>{item.taskName || '--'}</span>
                                </div>
                              </Cell>
                            </CellGroup>
                          )
                        })
                      }
                      {(inspectionTask.dataSource.length === 0 && inspectionTask.searchParams.pageNumber === 1) && <Empty description='暂无数据' />}
                    </List>
                  </PullRefresh>
                </Tab>)
            }
          </div>
        </Tabs>
      </div>
  }
})
