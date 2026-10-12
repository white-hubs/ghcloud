import { defineComponent, onMounted, ref } from 'vue'
import { CellGroup, Cell, Tabs, Tab, Loading } from 'vant'
import styles from './record-detail.module.less'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import { useMetaTitle } from '../../hooks/use-meta-title-hook'
import { cubeMaintainService } from '@/api/server'
import { PeriodDetailList } from './period-detail-list'
import type { ElectronTaskType, TaskDetailType } from '@ghcloud/cube-risk-management-service'
import { Bar } from '../../components/bar/bar'
/** 记录详情页面 */
export const RecordDetail = defineComponent({
  setup: () => {
    const route = useRoute()
    const loading = ref(false)
    const inspectionDetail = ref<TaskDetailType>({
      targetId: '',
      taskName: '',
      executeData: '',
      id: '',
      targetName: '',
      organizationName: '',
      areaName: '',
      time: '',
      result: '',
      completeDate: '',
      userName: '',
      patrolLocationNum: '',
      completedNum: '',
      undoneNum: '',
      untowardLocationNum: '',
      normalLocationNum: '',
      executePeriod: []
    })
    const patrolsList = ref([
      { title: '巡更点数', value: 'patrolLocationNum', color: '#3D3D3D' },
      { title: '已巡', value: 'completedNum', color: '#6AB539' },
      { title: '漏巡', value: 'undoneNum', color: '#FFAA26' },
      { title: '巡更点异常数', value: 'untowardLocationNum', color: '#FF4158' },
      { title: '巡更点正常数', value: 'normalLocationNum', color: '#1D66FF' },
    ])
    const patrolsListByPeriod = ref<ElectronTaskType[]>([])
    onMounted(async () => {
      useMetaTitle()
      getDetail()
    })
    const activeTab = ref('')
    const getDetail = async (): Promise<void> => {
      inspectionDetail.value = await cubeMaintainService.getElectronTaskById({ id: route.query.id as string ?? '' })
      if (inspectionDetail.value?.executePeriod?.length) {
        activeTab.value = inspectionDetail.value?.executePeriod[0] ?? ''
      }
      getTaskLocation()
    }
    const getTaskLocation = async (): Promise<void> => {
      loading.value = true
      patrolsListByPeriod.value = await cubeMaintainService.getElectronTaskLocation({ taskId: route.query.id as string ?? '', executePeriod: activeTab.value ?? '' })
      loading.value = false
    }
    const changeTab = async (name: string): Promise<void> => {
      activeTab.value = name
      getTaskLocation()
    }
    return (): JSX.Element =>
      <div>
        <Bar />
        <div style={{ background: '#f3f7fa', height: '94vh', padding: '12px', position: 'relative' }}>
          <CellGroup class={styles['inspection-detail-cell-group']}>
            <Cell>
              <div class={styles['inspection-cell-title']}>
                <span>{inspectionDetail.value?.taskName}</span>
              </div>
            </Cell>
            <Cell>
              <div class={styles['inspection-cell-content']}>
                <div>
                  <label>巡更时间：</label>
                  <span>{inspectionDetail.value?.executeData || '--'}</span>
                </div>
                <div>
                  <label>巡更人员：</label>
                  <span>{inspectionDetail.value?.userName || '--'}</span>
                </div>
                <div>
                  <label>完成时间：</label>
                  <span>{inspectionDetail.value?.completeDate ? dayjs(inspectionDetail.value?.completeDate).format('YYYY-MM-DD HH:mm') : '--'}</span>
                </div>
              </div>
              <div class={styles['patrols-cell-item']}>
                {patrolsList.value.map((x: { value: string; title: string; color: string; }) =>
                  <div class={styles.item} key={x.value}>
                    <div>{x.title}</div>
                    <div style={{ color: x.color, fontWeight: '500' }}>{inspectionDetail.value?.[x.value]}</div>
                  </div>)}
              </div>
            </Cell>
          </CellGroup>
          <Tabs v-model:active={activeTab.value} class={styles['inspection-detail-tabs']} title-active-color='#1989fa' onChange={changeTab}>
            {
              inspectionDetail.value?.executePeriod?.map(item =>
                <Tab title={item} name={item} key={item}>
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <Loading v-show={loading.value} />
                  </div>
                  <PeriodDetailList v-show={!loading.value} list={patrolsListByPeriod.value} />
                </Tab>)
            }
          </Tabs>
        </div>
      </div>
  }
})
