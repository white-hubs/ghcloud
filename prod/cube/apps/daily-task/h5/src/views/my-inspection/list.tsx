import { Button, DatePicker, Divider, Empty, Field, List, Popup, PullRefresh, Search, Tab, Tabs, Tag, showNotify } from 'vant'
import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import styles from './my-inspection.module.less'
import { useMetaTitle } from '../hooks/use-meta-title-hook'
import { useRoute, useRouter } from 'vue-router'
import { cubeDailyInspectionService, cubeOuaaService } from '@/api/server'
import { timeFormat } from '@/utils'
import { StatusColor, StatusColorBg, StatusType } from './type'
import { Bar } from '../../components/bar/bar'

interface MyInspectionType {
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

/** 日常巡检-我的巡检 */
export const MyInspection = defineComponent({
  setup: () => {
    useMetaTitle()
    const route = useRoute()
    const search = reactive({
      pageNumber: 0,
      total: 1,
      pageSize: 10,
      keyword: '',
      status: (route.query.status as string) ?? '',
      period: ''
    })
    const activeTab = ref((route.query.status as string) ?? '')
    const dataSource = ref<MyInspectionType[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const showPopUp = ref(false)
    const showStartPicker = ref(false)
    const showEndPicker = ref(false)
    const router = useRouter()
    const userId = ref('')
    // 获取数据
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyInspectionService.MyInspectionPage(search)
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
      } catch (error) {
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    const getUser = async (): Promise<void> => {
      try {
        const { id } = await cubeOuaaService.getUserMine()
        userId.value = id
      } catch (err) {
      }
    }
    onMounted(() => {
      onLoad()
      getUser()
    })
    const time = reactive({
      startTime: '',
      endTime: ''
    })

    const searchDom = {
      action: (): VNode => <div onClick={() => {
        showPopUp.value = true
      }}>筛选</div>
    }
    const tabs = ref([
      { title: '全部', status: 'ALL' },
      { title: '待接收', status: 'ACCEPT' },
      { title: '待巡检', status: 'EXECUTING' },
      { title: '已巡检', status: 'OVER' },
      // { title: '已过期', status: 'EXPIRE' },
      { title: '已终止', status: 'STOP' },
      { title: '待修复', status: 'WAIT_REPAIR' },
      { title: '已修复', status: 'REPAIRED' },
    ])
    // 开始时间
    const handleStartPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showStartPicker.value = false
      const startTime = selectedOptions.map((item) => item.text).join('/') + ' 00:00:00'
      if (new Date(startTime).getTime() > new Date(time.endTime).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      time.startTime = startTime
    }
    // 结束时间
    const handleEndPicker = ({ selectedOptions }: { selectedOptions: { text: string; }[]; }): void => {
      showEndPicker.value = false
      const endTime = selectedOptions.map((item) => item.text).join('/') + ' 23:59:59'
      if (new Date(endTime).getTime() < new Date(time.startTime).getTime()) {
        showNotify({ type: 'warning', message: '开始时间不能大于结束时间' })
        return
      }
      time.endTime = endTime
    }

    // 按时间查询
    const handleScreen = (): void => {
      search.pageNumber = 0
      showPopUp.value = false
      if (time.startTime !== '' && time.endTime !== '') {
        search.period = time.startTime + ',' + time.endTime
      } else {
        time.startTime = ''
        time.endTime = ''
      }
      onLoad()
    }

    // 下拉刷新
    const onRefresh = (): void => {
      search.pageNumber = 0
      finished.value = false
      onLoad()
    }
    // 切换标签
    const onClickTab = (): void => {
      search.period = ''
      search.status = activeTab.value
      if (activeTab.value === 'ALL')search.status = ''
      onRefresh()
    }
    // 查询
    const onSearch = (): void => {
      search.pageNumber = 0
      onLoad()
    }
    // 跳转详情
    const toDetail = (id: string): void => {
      router.push({ path: '/inspection-detail', query: { id, userId: userId.value } })
    }
    // 接收
    const handleResolve = async (e: Event, item: MyInspectionType): Promise<void> => {
      try {
        e.stopPropagation()
        await cubeDailyInspectionService.AcceptTask({ id: item.id })
        showNotify({ type: 'success', message: '接收成功' })
        onRefresh()
      } catch (err) {
        const { errorMessage } = (err as { toJSON: () => { errorMessage: string; }; }).toJSON()
        showNotify({ type: 'danger', message: errorMessage || '请求失败' })
      }
    }
    // 移交
    const handleTransfer = async (e: Event, item: MyInspectionType): Promise<void> => {
      e.stopPropagation()
      router.push({ path: '/choice-staff', query: { action: 'transfer', id: item.id } })
    }
    // 添加协同人
    const handleAddPartner = async (e: Event, item: MyInspectionType): Promise<void> => {
      e.stopPropagation()
      router.push({ path: '/choice-staff', query: { action: 'add-partner', id: item.id } })
    }
    return (): VNode=>
      <div class={styles.wrapper}>
        {/* <Bar rightName='档案' name={route.query.entityId ? '我的巡检' : '巡检任务'} onRight={() => { router.push({ path: 'my-inspection/file-detail', query: { entityId: route.query.entityId, entityName: route.query.entityName } }) }} /> */}
        <Bar name={route.query.entityId ? '我的巡检' : '巡检任务'} />
        <Search v-model={search.keyword} placeholder='根据任务名称进行搜索' show-action v-slots={searchDom} onSearch={onSearch} onClear={onSearch} />
        <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
          {tabs.value.map(item =>
            <Tab title={item.title} name={item.status} key={item.title}>
              <PullRefresh v-model={refreshing.value} onRefresh={onRefresh} style={{ height: '77vh', marginTop: '5px', overflow: 'auto' }}>
                <List
                  v-model:loading={loading.value}
                  finished={finished.value}
                  finished-text={dataSource.value.length === 0 ? '' : '暂无更多数据'}
                  onLoad={onLoad}
                >
                  {
                    (dataSource.value && dataSource.value.length > 0) &&
                    dataSource.value.map((item: MyInspectionType) =>
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
                            handleTransfer(e, item)
                          }}>移交</Button>
                          <Button v-show={item.status === 'EXECUTING' && item.receiveIds === userId.value} type='primary' size='small' onClick={(e: Event) => {
                            handleAddPartner(e, item)
                          }}>添加协同</Button>
                        </div>
                      </div>)
                  }
                  {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
                </List>
              </PullRefresh>
            </Tab>)}
        </Tabs>
        <Popup
          v-model:show={showPopUp.value}
          position='right'
          style={{ width: '90vw', height: '100vh' }}
        >
          <div style={{ margin: '10px' }}>时间范围</div>
          <div class={styles.screen}>
            <Field
              v-model={time.startTime}
              is-link
              readonly
              name='startTime'
              placeholder='开始时间'
              onClick={() => {
                showStartPicker.value = true
              }}
            />
            <Field
              v-model={time.endTime}
              is-link
              readonly
              name='startTime'
              placeholder='结束时间'
              onClick={() => {
                showEndPicker.value = true
              }}
            />
          </div>
          <Popup v-model:show={showStartPicker.value} position='bottom'>
            <DatePicker onConfirm={handleStartPicker} onCancel={() => {
              showStartPicker.value = false
            }} />
          </Popup>
          <Popup v-model:show={showEndPicker.value} position='bottom'>
            <DatePicker onConfirm={handleEndPicker} onCancel={() => {
              showEndPicker.value = false
            }} />
          </Popup>
          <div style={{ margin: '16px', display: 'flex', justifyContent: 'flex-end' }}>
            <Button size='small' style={{ marginRight: '16px' }} onClick={() => {
              time.startTime = ''; time.endTime = ''; search.period = ''
            }}>
              重置
            </Button>
            <Button size='small' type='primary' onClick={handleScreen}>
              提交
            </Button>
          </div>
        </Popup>
      </div>
  }
})
