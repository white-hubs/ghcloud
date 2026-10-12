import { List, Empty, PullRefresh, Cell, CellGroup, Field, Form, Search, RadioGroup, Radio, Tabs, Tab, Popup, DatePicker, showNotify } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import styles from './standing-book.module.less'
import { useRoute, useRouter } from 'vue-router'
import { Bar } from '../../components/bar/bar'
import { cubeMaintainService } from '@/api/server'
import { StatusColor, StatusType } from './type'
import type { InspectRecord } from '@ghcloud/cube-maintain-service'
import { timeFormat } from '@/utils'

/** 巡检台账列表页 */
export const StandingBook = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const dataSource = ref<InspectRecord[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const search = reactive({
      period: '',
      result: (route.query.type as string) ?? '',
      status: '',
      targetCategory: '',
      keyword: '',
      pageNumber: 0,
      total: 1,
      pageSize: 10
    })
    const time = reactive({
      startTime: '',
      endTime: ''
    })
    const showStartPicker = ref(false)
    const showEndPicker = ref(false)
    const tabs = ref([
      { title: '全部', status: 'ALL' },
      { title: '待接收', status: 'ACCEPT' },
      { title: '待巡检', status: 'EXECUTING' },
      { title: '已巡检', status: 'OVER' },
      { title: '已过期', status: 'EXPIRE' },
      { title: '已终止', status: 'STOP' },
    ])
    const activeTab = ref('')
    const statusList = [
      { name: 'NORMAL', title: '正常' },
      { name: 'ABNORMAL', title: '异常' },
    ]
    // 获取巡检台账列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeMaintainService.getInspectRecord({ ...search })
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
      } catch (error) {
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
    // 切换标签
    const onClickTab = (): void => {
      search.period = ''
      search.status = activeTab.value
      if (activeTab.value === 'ALL')search.status = ''
      onSearch()
    }
    // 选择结果查询
    const changeResult = (value: string): void => {
      search.result = value
    }
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
    // 选择结果
    const resultDom = (): VNode =>
      <RadioGroup v-model={search.result} direction='horizontal' icon-size='14px' onChange={changeResult}>
        {
          statusList.map(item =>
            <Radio key={item.name} class={styles.checkbox} name={item.name} style={{ color: `${search.result === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${search.result === item.name ? '#E6EFFF' : '#F8F9F9'}` }} v-slots={{ icon: () => <div style={{ width: '90px' }}>{item.title}</div> }} />)
        }
      </RadioGroup>
    const filterDom = (): VNode =>
      <div class={styles.filter}>
        <div>
          <Form>
            <p>时间范围</p>
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
            <p>巡检结果</p>
            <div style='margin-bottom:10px'>
              <Field style={{ padding: '0px' }} name='type' v-slots={{ input: resultDom() }} />
            </div>
          </Form>
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
        </div>
      </div>

    // 进入详情
    const toDetail = (item: InspectRecord): void => {
      router.push({ path: '/file-detail', query: { targetId: item.targetId } })
    }
    const showRight = ref(false)
    const submit = (): void => {
      if (time.startTime !== '' && time.endTime !== '') {
        search.period = time.startTime + ',' + time.endTime
      } else {
        time.startTime = ''
        time.endTime = ''
      }
      onSearch()
    }
    return (): VNode =>
      <div>
        <Bar onReset={() => {
          search.targetCategory = ''; search.result = ''; search.status = ''; time.endTime = ''; time.startTime = ''; search.period = ''
        }} showRight={showRight.value} onSubmit={submit}>{filterDom()}</Bar>
        <Search v-model={search.keyword} placeholder='根据任务名称进行搜索' onSearch={onSearch} />
        <Tabs v-model:active={activeTab.value} class={styles.tabs} shrink sticky onClickTab={onClickTab}>
          <div style={{ height: '78vh', background: '#f3f7fa' }}>
            {
              tabs.value.map(item =>
                <Tab title={item.title} name={item.status} key={item.title}>
                  <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '78vh', overflow: 'auto' }}>
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
                            <CellGroup inset class={styles['cell-group']} key={item.id}>
                              <Cell>
                                <div class={styles['cell-title']}>
                                  <div class={styles['name-status']}>
                                    <span class={[styles.status]} style={{ background: StatusColor.get(item.status) }}>{StatusType.get(item?.status)}</span>
                                    <span class={styles.name}>{item.targetName}</span>
                                  </div>
                                </div>
                              </Cell>
                              <Cell class={styles.cell} onClick={() => {
                                toDetail(item)
                              }}>
                                <div class={styles['cell-item']}>
                                  <label>创建时间：</label>
                                  <span>{(item?.createTime && timeFormat(item.createTime, true)) || '--'}</span>
                                </div>
                                <div class={styles['cell-item']}>
                                  <label>巡检时间：</label>
                                  <span>{(item?.time && timeFormat(item.time, true)) || '--'}</span>
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
                      {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
                    </List>
                  </PullRefresh>
                </Tab>)
            }
          </div>
        </Tabs>
      </div>
  }
})
