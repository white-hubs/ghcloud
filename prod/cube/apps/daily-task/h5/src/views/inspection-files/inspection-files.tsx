import { List, Empty, PullRefresh, Cell, CellGroup, Field, Form, Search, Popup, Cascader, type CascaderOption, RadioGroup, Radio, DatePicker, showNotify } from 'vant'
import { defineComponent, reactive, ref, type VNode } from 'vue'
import styles from './inspection-files.module.less'
import { useRoute, useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { Bar } from '../../components/bar/bar'
import { cubeDailyInspectionService, cubeMdataService } from '@/api/server'
import type { AreaTree } from '@ghcloud/cube-mdata-service'
import type { RecordPage } from '@ghcloud/cube-daily-inspection-service'

/** 巡检档案列表页 */
export const FileList = defineComponent({
  setup: () => {
    const router = useRouter()
    const route = useRoute()
    const dataSource = ref<RecordPage[]>([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const checked = ref<string>('')
    const showAreaPicker = ref(false)
    const areaOptions = ref<AreaTree[]>([])
    const search = reactive({
      targetId: route.query.entityId as string,
      period: route.query.period as string,
      status: 'OVER',
      targetCategory: '',
      areaName: '',
      keyword: '',
      areaId: '',
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
    const removeNullChild = (option: CascaderOption): void => {
      if (option.children) {
        if (option.children.length === 0) {
          delete option.children
        } else {
          for (const iterator of option.children) {
            removeNullChild(iterator)
          }
        }
      }
    }
    const getArea = async (): Promise<void> => {
      const res = await cubeMdataService.getAreaTree()
      for (const iterator of res) {
        removeNullChild(iterator)
      }
      areaOptions.value = res
    }
    getArea()
    // 选择区域查询
    const handleArea = (options: { selectedOptions: []; value: string; }): void => {
      search.areaName = options.selectedOptions.map((item: { name: string; }) => item.name).join('/')
      search.areaId = options.value
      showAreaPicker.value = false
    }
    const typeList = [
      { name: 'DEVICE', title: '设备' },
      { name: 'STALL', title: '档位' },
      { name: 'PROPERTY', title: '资产' },
      { name: 'SITE_POINT', title: '现场点' },
      { name: 'RISK_SOURCE', title: '风险源' },
      { name: 'PATROL_POINT', title: '巡更点' },
    ]
    // 选择类型查询
    const changeType = (value: string): void => {
      search.targetCategory = value
    }
    // 选择类型
    const typeDom = (): VNode =>
      <RadioGroup v-model={search.targetCategory} direction='horizontal' icon-size='14px' onChange={changeType}>
        {
          typeList.map(item =>
            <Radio key={item.name} class={styles.checkbox} name={item.name} style={{ color: `${search.targetCategory === item.name ? '#1D66FF' : '#1F3140'}`, backgroundColor: `${search.targetCategory === item.name ? '#E6EFFF' : '#F8F9F9'}` }} v-slots={{ icon: () => <div style={{ width: '90px' }}>{item.title}</div> }} />)
        }
      </RadioGroup>
    const filterDom = (): VNode =>
      <div class={styles.filter}>
        <div>
          <Form>
            <p>类型</p>
            <div style='margin-bottom:10px'>
              <Field style={{ padding: '0px' }} name='type' v-slots={{ input: typeDom() }} />
            </div>
            <p>区域</p>
            <Field
              v-model={search.areaName}
              is-link
              readonly
              name='area'
              placeholder='选择区域'
              onClick={() => {
                showAreaPicker.value = true
              }}
            />
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
          <Popup v-model:show={showAreaPicker.value} position='bottom'>
            <Cascader v-model={search.areaId} onFinish={handleArea} field-names={{ text: 'name', value: 'id', children: 'children' }} options={areaOptions.value} onCancel={() => {
              showAreaPicker.value = false
            }} />
          </Popup>
        </div>
      </div>
    // 获取巡检档案列表
    const onLoad = async (): Promise<void> => {
      try {
        loading.value = true
        search.pageNumber++
        const res = await cubeDailyInspectionService.targetRecordPage({ ...search })
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
      if (time.startTime !== '' && time.endTime !== '') {
        search.period = time.startTime + ',' + time.endTime
      } else {
        time.startTime = ''
        time.endTime = ''
      }
      onLoad()
    }
    // 进入详情
    const toDetail = (item: RecordPage): void => {
      router.push({ path: '/file-detail', query: { targetId: item.targetId } })
    }
    const showRight = ref(false)
    const submit = (): void => {
      onSearch()
      showRight.value = false
    }
    return (): VNode =>
      <div>
        <Bar onReset={() => {
          checked.value = ''; search.areaId = ''; search.areaName = ''; search.targetCategory = ''
        }} showRight={showRight.value} onSubmit={submit}>{filterDom()}</Bar>
        <Search v-model={search.keyword} placeholder='根据对象名称进行搜索' onSearch={onSearch} />
        <div style={{ height: '87vh', background: '#f3f7fa' }}>
          <PullRefresh v-model={refreshing.value} onRefresh={onSearch} style={{ height: '87vh', overflow: 'auto' }}>
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
                  <CellGroup inset class={styles['fault-cell-group']} key={item.id}>
                    <Cell>
                      <div class={styles['fault-cell-title']}>
                        <div class={styles['name-status']}>
                          <span class={styles.name}>{item.targetName}</span>
                        </div>
                      </div>
                    </Cell>
                    <Cell class={styles['fault-cell']} onClick={() => {
                      toDetail(item)
                    }}>
                      <div class={styles['fault-cell-item']}>
                        <label>所属部门：</label>
                        <span>{item?.organizationName || '--'}</span>
                      </div>
                      <div class={styles['fault-cell-item']}>
                        <label>所在区域：</label>
                        <span>{item.areaName || '--'}</span>
                      </div>
                      <div class={styles['fault-cell-item']}>
                        <label>最近巡检时间：</label>
                        <span>{dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}</span>
                      </div>
                      <div class={styles['fault-cell-item']}>
                        <label>最近巡检结果：</label>
                        <span style={{ color: `${item.result === 'NORMAL' ? '#6AB539' : '#FF4158'}` }}>{item.result === 'NORMAL' ? '正常' : '异常'}</span>
                      </div>
                    </Cell>
                  </CellGroup>
                )
              })
              }
              {(dataSource.value.length === 0 && search.pageNumber === 1) && <Empty description='暂无数据' />}
            </List>
          </PullRefresh>
        </div>
      </div>
  }
})
