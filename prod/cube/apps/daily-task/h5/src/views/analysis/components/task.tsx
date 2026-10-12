import { defineComponent, ref, watch, type VNode } from 'vue'
import styles from './analysis.module.less'
import { Empty, Icon, showNotify } from 'vant'
import { getAssetsFile } from '@/utils'
import { RatioPie } from '@/components/echart/ratio-pie'
import { Pie } from '@/components/echart/pie'
import { Line } from '@/components/echart/line'
import { cubeMaintainService } from '@/api/server'
import type { FrequencyAnalysis, PlanAnalysis, TaskAnalysis } from '@ghcloud/cube-maintain-service'
/** 巡检任务分析 */
export const Task = defineComponent({
  props: {
    time: {
      type: Object,
      default: () => {
        return {
          name: '',
          value: ''
        }
      }
    },
    activeTab: {
      type: String,
      default: ''
    },
  },
  setup: (props) => {
    const plan = ref<PlanAnalysis>({
      patrolSchemeTotal: 0,
      proportionOfPlanTypesVOS: []
    })
    const trend = ref<{ name: string; data: number[]; }[]>([{ name: '巡检任务数', data: [] }, { name: '巡检次数', data: [] }])
    const trendX = ref()
    const task = ref<TaskAnalysis>({
      taskTotalNum: 0,
      taskTotalNumRatio: '',
      completeTaskNum: 0,
      completeTaskNumRatio: '',
      completeTaskNumProportion: '',
      abnormalTaskNum: 0,
      abnormalTaskNumRatio: '',
      abnormalTaskNumProportion: '',
      expireTaskNum: 0,
      expireTaskNumRatio: '',
      expireTaskNumProportion: '',
      periodTaskNum: 0,
      taskNum: 0,
      periodTaskNumProportion: ''
    })
    const frequency = ref<FrequencyAnalysis>({
      taskTotalNum: 0,
      objNum: 0,
      objCoverageRate: '',
      objCoverageRateRatio: '',
      inspectionTotalNum: 0,
      inspectionTotalNumRatio: '',
      trendOfInspectionTimesVOS: []
    })
    const planPie = ref()
    const taskPie = ref([
      { name: '期间循环任务', proportion: 0, num: 0 },
      { name: '任务完成', proportion: 0, num: 0, ratio: '' },
      { name: '结果异常', proportion: 0, num: 0, ratio: '' },
      { name: '过期未执行', proportion: 0, num: 0, ratio: '' },
    ])
    const initData = async (): Promise<void> => {
      try {
        const dataPlan = await cubeMaintainService.inspectionPlanAnalysis({ period: props.time.value })
        plan.value = dataPlan
        planPie.value = dataPlan.proportionOfPlanTypesVOS.map(x => {
          return { value: x.planNum, name: x.planType }
        })
        const dataTask = await cubeMaintainService.inspectionTaskAnalysis({ period: props.time.value })
        task.value = dataTask
        // 期间循环任务
        taskPie.value[0].proportion = Number(dataTask.periodTaskNumProportion.replace('%', ''))
        taskPie.value[0].num = dataTask.periodTaskNum
        // 任务完成
        taskPie.value[1].proportion = Number(dataTask.completeTaskNumProportion.replace('%', ''))
        taskPie.value[1].num = dataTask.completeTaskNum
        taskPie.value[1].ratio = dataTask.completeTaskNumRatio
        // 结果异常
        taskPie.value[2].num = dataTask.abnormalTaskNum
        taskPie.value[2].proportion = Number(dataTask.abnormalTaskNumProportion.replace('%', ''))
        taskPie.value[2].ratio = dataTask.abnormalTaskNumRatio
        // 过期未执行
        taskPie.value[3].num = dataTask.expireTaskNum
        taskPie.value[3].proportion = Number(dataTask.expireTaskNumProportion.replace('%', ''))
        taskPie.value[3].ratio = dataTask.expireTaskNumRatio
        const dataFrequency = await cubeMaintainService.inspectionFrequencyAnalysis({ period: props.time.value })
        frequency.value = dataFrequency
        trend.value[0].data = dataFrequency.trendOfInspectionTimesVOS.map(x => x.taskNum)
        trend.value[1].data = dataFrequency.trendOfInspectionTimesVOS.map(x => x.numberOfInspection)
        trendX.value = dataFrequency.trendOfInspectionTimesVOS.map(x => x.abscissa)
      } catch (err) {
        showNotify({ type: 'danger', message: '请求错误' })
      }
    }
    watch(() => props.time, () => {
      if (props.activeTab === 'task') {
        initData()
      }
    }, { deep: true, immediate: true })
    watch(() => props.activeTab, () => {
      if (props.activeTab === 'task') {
        initData()
      }
    })

    return (): VNode =>
      <div class={styles.task}>
        {/* 巡检计划=========================== */}
        <p class={styles.description}>
          共有<span>{plan.value.patrolSchemeTotal}</span>个巡检计划正常使用，其中
          <span>{plan.value.proportionOfPlanTypesVOS[0]?.planType ?? '--'}</span>的巡检计划最多，有
          <span>{plan.value.proportionOfPlanTypesVOS[0]?.planNum ?? '--'}</span>个
        </p>
        <div style={{ height: '200px', width: '330px', margin: '0 auto' }}>
          {planPie.value?.length > 0 ? <Pie data={planPie.value} /> : <Empty />}
        </div>
        {/* 巡检任务=========================== */}
        <p class={styles.description}>截止到目前，一共下发了<span>{task.value.taskTotalNum}</span>个巡检任务，其中
          <span>{task.value.completeTaskNum}</span>个任务正常执行完成，结果异常有<span>{task.value.abnormalTaskNum}</span>个，
          过期未执行有<span>{task.value.expireTaskNum}</span>个
        </p>
        <div class={styles['task-title']}>
          <div class={styles.content}><div class={styles.icon}><Icon name='completed' size='16' color='#ffffff' /></div>巡检任务</div>
          <div class={styles.content} style={{ alignItems: 'flex-end' }}>
            <div><span style={{ fontSize: '16px', fontWeight: '500', color: 'var(--van-primary-color)' }}>{task.value.taskTotalNum}</span>个
            </div>
            <div><span style={{ color: '#646D81', marginLeft: '4px' }}>环比</span>
              <img
                width='12'
                style={{ background: 'rgba(0,0,0,0)' }}
                src={task.value.taskTotalNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
              />
              <span style={{ fontSize: '12px', color: `${task.value.taskTotalNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{task.value.taskTotalNumRatio}
              </span>
            </div>
          </div>
        </div>
        <div class={styles['task-ratio']}>
          {
            task.value.taskTotalNum > 0
              ? (taskPie.value.map((x, i) =>
                <div key={i} class={styles.item}>
                  <div style={{ width: '80px', height: '80px', margin: '0 auto' }}>
                    <RatioPie
                      ratio={x.proportion ?? 0}
                      name={x.proportion + '%' || '0.00%'}
                      color={['#1D66FF', '#01B377', '#FFAA00', '#778bf7'][i]}
                      radius={['85%', '100%']}
                      titlePosition={{ left: '45%', top: '32%' }}
                    />
                  </div>
                  <div style={{ textAlign: 'center', color: '#646D81', fontSize: '13px', margin: '5px' }}>
                    <div><span style={{ color: '#1F3140', fontSize: '16px', fontWeight: '500' }}>{x.num}</span>个</div>
                    <div>
                      <div v-show={x.ratio}>
                        <span style={{ color: '#646D81' }}>环比</span>
                        <img
                          width='12'
                          style={{ background: 'rgba(0,0,0,0)' }}
                          src={x.ratio?.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
                        />
                        <span style={{ fontSize: '12px', color: `${x.ratio?.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{x?.ratio}</span>

                      </div>
                      <div>{x.name}</div>
                    </div>
                  </div>
                </div>))
              : <Empty style={{ width: '100%' }} />
          }
        </div>
        {/* 巡检频率 */}
        <p class={styles.description}>在此期间，一共下发了<span>{frequency.value.taskTotalNum}</span>个巡检任务，覆盖对象有
          <span>{frequency.value.objNum}</span>个
        </p>
        <div class={styles['task-percentage']}>
          <div>
            <div>
              <span style={{ fontSize: '16px' }}>{frequency.value.objCoverageRate}</span>
              <span style={{ color: '#646D81' }}>环比</span>
              <img
                width='12'
                style={{ background: 'rgba(0,0,0,0)' }}
                src={frequency.value.objCoverageRateRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
              />
              <span style={{ fontSize: '12px', color: `${frequency.value.objCoverageRateRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{frequency.value.objCoverageRateRatio}</span>
            </div>
            <div style={{ color: '#646D81' }}>对象覆盖率</div>
          </div>
          <div>
            <div>
              <span style={{ fontSize: '16px' }}>{frequency.value.inspectionTotalNum}</span>
              <span style={{ color: '#646D81' }}>环比</span>
              <img
                width='12'
                style={{ background: 'rgba(0,0,0,0)' }}
                src={frequency.value.inspectionTotalNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
              />
              <span style={{ fontSize: '12px', color: `${frequency.value.inspectionTotalNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{frequency.value.inspectionTotalNumRatio}</span>
            </div>
            <div style={{ color: '#646D81' }}>巡检次数</div>
          </div>
        </div>
        <div class={styles.trend}>
          <p>巡检趋势</p>
          <div style={{ height: '220px', width: '98vw', margin: '0 auto' }}>
            {
              trendX.value?.length > 0
                ? <Line data={trend.value} xAxis={trendX.value} />
                : <Empty />
            }
          </div>
        </div>
      </div>
  }
})
