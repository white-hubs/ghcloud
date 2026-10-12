import { Button, Divider, Empty, List, PullRefresh, Search, Tab, Tabs, Tag } from 'vant'
import { defineComponent, onMounted, reactive, ref, type PropType } from 'vue'
import styles from './inspection-task.module.less'
import { useRouter } from 'vue-router'
import { cubeOuaaService } from '../../../../api/service'
import { timeFormat } from '../../../../utils/index'
import { type InspectionParams, StatusColor, StatusColorBg, StatusType } from '../type'
import { InspectionTask } from '../task'
import { SearchForm } from './search-form'
import { ChoiceStaff } from '../../../ouaa-components/choice-staff/choice-staff'

interface MyInspectionType {
  [key: string]: unknown;
  id: string;
  planName: string;
  name: string;
  status: string;
  isCheck: boolean;
  level: string;
  targetNum: number;
  validBeginTime: number;
  validEndTime: number;
  receiveNames: string;
  receiveIds?: string;
}
interface InspectionSearchType {
  [key: string]: unknown;
  pageNumber: number;
  total: number;
  pageSize: number;
  keyword: string;
  status: string;
  period: string;
}

/** 巡检任务列表 */
export const InspectionTaskList = defineComponent({
  props: {
    options: {
      type: Object as PropType<{
        searchParams: InspectionParams;
        getListApi: (params?: InspectionParams) => Promise<{ records: MyInspectionType[]; total: number; }>;
        resolveApi: (params?: unknown) => Promise<unknown>;
        addPartnerApi: (params?: unknown) => Promise<unknown>;
        transferApi: (params?: unknown) => Promise<unknown>;
      }>,
      default: () => {
        return {}
      }
    },
  },
  setup: (props) => {
    const activeTab = ref('')
    const showPopUp = ref(false)
    const showStaffPopUp = ref(false)
    const router = useRouter()
    const userId = ref('')
    const chosenUserId = ref('')
    const actionType = ref('')
    const search = reactive<InspectionSearchType>({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: '',
      status: '',
      period: '',
      startTime: '',
      endTime: ''
    })
    const inspectionTask = new InspectionTask<MyInspectionType>({ ...props.options })
    onMounted(() => {
      onLoad()
      getUser()
    })
    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch {}
    }

    const searchDom = {
      action: (): JSX.Element => <div onClick={() => {
        showPopUp.value = true
      }}>筛选</div>
    }
    const tabs = ref([
      { title: '全部', status: 'ALL' },
      { title: '待确认', status: 'ACCEPT' },
      { title: '巡检中', status: 'EXECUTING' },
      { title: '已完成', status: 'OVER' },
      { title: '已过期', status: 'EXPIRE' },
      { title: '已终止', status: 'STOP' },
    ])
    // 切换标签
    const onClickTab = (): void => {
      search.status = activeTab.value
      if (activeTab.value === 'ALL')search.status = ''
      inspectionTask.updateSearchParams(search)
      inspectionTask.refreshData()
    }
    // 查询
    const onSearch = (val: InspectionParams): void => {
      Object.assign(search, val)
      inspectionTask.updateSearchParams(search)
      inspectionTask.refreshData()
      showPopUp.value = false
    }
    // 移交/添加协同人
    const onSearchStaff = (val: { id: string; }): void => {
      if (actionType.value === 'partner') {
        inspectionTask.submitData(
          async (val) => props.options.addPartnerApi(val),
          { id: chosenUserId.value, userId: val.id },
          '添加成功'
        )
      } else {
        inspectionTask.submitData(
          async (val) => props.options.transferApi(val), { id: chosenUserId.value, userId: val.id },
          '移交成功'
        )
      }
    }
    // 获取数据
    const onLoad = async (): Promise<void> => {
      await inspectionTask.loadData()
    }
    // 跳转详情
    const toDetail = (id: string): void => {
      router.push({ path: '/inspection-task-detail', query: { id, userId: userId.value } })
    }
    // 接收
    const handleResolve = async (e: Event, item: MyInspectionType): Promise<void> => {
      e.stopPropagation()
      inspectionTask.submitData(
        async (val) => props.options.resolveApi(val),
        item,
        '接收成功'
      )
    }
    // 选择人员
    const handleChoiceStaff = async (e: Event, item: MyInspectionType, type: string): Promise<void> => {
      actionType.value = type
      chosenUserId.value = item.id
      e.stopPropagation()
      showStaffPopUp.value = true
    }
    return (): JSX.Element =>
      <div class={styles.wrapper}>
        <Search v-model={search.keyword} placeholder='根据任务名称进行搜索' show-action v-slots={searchDom} onSearch={onSearch} onClear={onSearch} />
        <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
          {tabs.value.map(item =>
            <Tab title={item.title} name={item.status} key={item.title}>
              <PullRefresh v-model={inspectionTask.loadingStatus.refreshing} onRefresh={() => {
                inspectionTask.refreshData()
              }} style={{ height: '80vh', marginTop: '5px', overflow: 'auto' }}>
                <List
                  v-model:loading={inspectionTask.loadingStatus.loading}
                  finished={inspectionTask.loadingStatus.finished}
                  finished-text={inspectionTask.dataSource.length === 0 ? '' : '暂无更多数据'}
                  onLoad={onLoad}
                >
                  {
                    (inspectionTask.dataSource && inspectionTask.dataSource.length > 0) &&
                    inspectionTask.dataSource.map((item: MyInspectionType) =>
                      <div class={styles['cell-group']} key={item.id} onClick={() => {
                        if (item.status !== 'ACCEPT') {
                          toDetail(item.id)
                        }
                      }}>
                        <div class={styles.title}>
                          <div>
                            <Tag size='medium' text-color={StatusColor.get(item.status)} color={StatusColorBg.get(item.status)}>{StatusType.get(item.status)}</Tag>
                            {
                              item.isCheck
                                ? <Tag text-color='#1989fa' color='rgb(25,137,250,.1)' style={{ marginLeft: '5px' }} size='medium'>稽查</Tag>
                                : null
                            }
                            <span class={styles['title-name']}>{item.name}
                            </span>
                          </div>
                          <div style={{ color: '#ff4158' }}>{item.level === 'URGENT' ? '紧急' : ''}</div>
                        </div>
                        <Divider style={{ margin: '10px' }} />
                        <div class={styles.content}>
                          <div><span style={{ color: '#8f8f8f' }}>责任人：</span><span>{item.receiveNames}</span></div>
                          <div><span style={{ color: '#8f8f8f' }}>巡检对象数：</span><span>{item.targetNum}</span></div>
                          <div><span style={{ color: '#8f8f8f' }}>开始时间：</span><span>{timeFormat(item.validBeginTime, true)}</span></div>
                          <div><span style={{ color: '#8f8f8f' }}>截至时间：</span><span>{timeFormat(item.validEndTime, true)}</span></div>
                        </div>
                        <Divider style={{ margin: '5px' }} />
                        <div class={styles.footer}>
                          <Button v-show={item.status === 'ACCEPT'} type='primary' size='small' onClick={(e: Event) => {
                            handleResolve(e, item)
                          }}>接收</Button>
                          <Button v-show={item.status === 'EXECUTING' && item.receiveIds === userId.value} plain type='primary' size='small' onClick={(e: Event) => {
                            handleChoiceStaff(e, item, 'transfer')
                          }}>移交</Button>
                          <Button v-show={item.status === 'EXECUTING' && item.receiveIds === userId.value} type='primary' size='small' onClick={(e: Event) => {
                            handleChoiceStaff(e, item, 'partner')
                          }}>添加协同</Button>
                        </div>
                      </div>)
                  }
                  {(inspectionTask.dataSource.length === 0 && inspectionTask.searchParams.pageNumber === 1) && <Empty description='暂无数据' />}
                </List>
              </PullRefresh>
            </Tab>)}
        </Tabs>
        <SearchForm
          v-model:visible={showPopUp.value}
          onSearch={onSearch}
          onOnUpdate:visible={() => {
            showPopUp.value = false
          }}
        />
        <ChoiceStaff
          v-model:visible={showStaffPopUp.value}
          onSearch={onSearchStaff}
        />
      </div>
  }
})
