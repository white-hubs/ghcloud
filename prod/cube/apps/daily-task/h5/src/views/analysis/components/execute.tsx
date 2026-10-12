import { defineComponent, reactive, ref, watch, type VNode } from 'vue'
import styles from './analysis.module.less'
import { getAssetsFile } from '@/utils'
import { StackBar } from '@/components/echart/stack-bar'
import { Rank } from '@/components/rank/rank'
import { cubeMaintainService } from '@/api/server'
import { Empty, showNotify } from 'vant'
import { BaseBar } from '@/components/echart/base-bar'
import _ from 'lodash'

/** 执行任务分析 */
export const Execute = defineComponent({
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
    const taskExecution = ref([
      { label: '任务总数', value: 0 },
      { label: '超时完成任务数', value: 0 },
      { label: '过期未执行任务数', value: 0 },
      { label: '结果异常任务数', value: 0 },
    ])
    const depTaskExecutionList = ref<{ name: string; data: number[]; }[]>([
      { name: '任务总数', data: [] },
      { name: '正常', data: [] },
      { name: '超时', data: [] },
      { name: '过期', data: [] },
    ])
    const depTaskExecutionXAxis = ref()
    const depTaskExecutionNum = reactive({
      maxTaskNumDep: '',
      maxTaskNum: 0,
      maxTaskNumRatio: '',
      maxTaskRatioDep: '',
      maxTaskRatio: '',
      maxTaskRatioRatio: '',
      minTaskNumDep: '',
      minTaskNum: 0,
      minTaskNumRatio: '',
      minTaskRatioDep: '',
      minTaskRatio: '',
      minTaskRatioRatio: ''

    })
    const taskTop5 = ref<{ name: string; data: number[]; }[]>([
      { name: '任务总数', data: [] },
      { name: '正常', data: [] },
    ])
    const taskLast5 = ref<{ name: string; data: number[]; }[]>([
      { name: '任务总数', data: [] },
      { name: '正常', data: [] },
    ])
    const taskTimeData = ref()
    const taskTimeBarData = ref<{ name: string; data: number[]; }[]>([
      { name: '', data: [] },
    ])
    const depTaskExecutionXAxisLast = ref()
    const totalRatio = ref('')
    const analysisOfAuditData = reactive({
      totalCheckTaskNum: 0,
      totalCheckTaskNumRatio: '0.00%'
    })
    const analysisOfAuditTop5 = ref()
    const analysisOfAuditLast5 = ref()
    const rankTopData = ref()
    const rankLastData = ref()
    const rankHead = [
      { title: '排名', key: 'rank' },
      { title: '任务名称', key: 'taskName' },
      { title: '发布时间', key: 'releaseTime' },
      { title: '责任人', key: 'dutyOfficer' },
      { title: '稽查结果匹配率', key: 'matchRatio' },
      { title: '不匹配项数', key: 'notMatchNum' }]
    const initData = async (): Promise<void> => {
      try {
        const {
          addDepTask,
          maxTaskNumDep,
          maxTaskNum,
          maxTaskNumRatio,
          maxTaskRatioDep,
          maxTaskRatio,
          maxTaskRatioRatio,
          minTaskNumDep,
          minTaskNum,
          minTaskNumRatio,
          minTaskRatioDep,
          minTaskRatio,
          minTaskRatioRatio
        } = await cubeMaintainService.depTaskExecutionAnalysis({ period: props.time.value })
        // 部门完成情况
        depTaskExecutionList.value[0].data = addDepTask.map(x => x.totalTaskNum)
        depTaskExecutionList.value[1].data = addDepTask.map(x => x.completeTaskNum)
        depTaskExecutionList.value[2].data = addDepTask.map(x => x.overTimeTaskNum)
        depTaskExecutionList.value[3].data = addDepTask.map(x => x.expireTaskNum)
        depTaskExecutionNum.maxTaskNumDep = maxTaskNumDep
        depTaskExecutionNum.maxTaskNum = maxTaskNum
        depTaskExecutionNum.maxTaskNumRatio = maxTaskNumRatio
        depTaskExecutionNum.maxTaskRatioDep = maxTaskRatioDep
        depTaskExecutionNum.maxTaskRatio = maxTaskRatio
        depTaskExecutionNum.maxTaskRatioRatio = maxTaskRatioRatio
        // 巡检任务Top5
        const arrTop = _.cloneDeep(addDepTask).sort((a, b) => b.totalTaskNum - a.totalTaskNum).slice(0, 5)
        taskTop5.value[0].data = arrTop.map(x => x.totalTaskNum)
        taskTop5.value[1].data = arrTop.map(x => x.completeTaskNum)
        depTaskExecutionXAxis.value = arrTop.map(x => x.depName)
        depTaskExecutionNum.minTaskNumDep = minTaskNumDep
        depTaskExecutionNum.minTaskNum = minTaskNum
        depTaskExecutionNum.minTaskNumRatio = minTaskNumRatio
        depTaskExecutionNum.minTaskRatioDep = minTaskRatioDep
        depTaskExecutionNum.minTaskRatio = minTaskRatio
        depTaskExecutionNum.minTaskRatioRatio = minTaskRatioRatio
        // 巡检任务Last5
        const arrLast = _.cloneDeep(addDepTask).sort((a, b) => a.totalTaskNum - b.totalTaskNum).slice(0, 5)
        taskLast5.value[0].data = arrLast.map(x => x.totalTaskNum)
        taskLast5.value[1].data = arrLast.map(x => x.completeTaskNum)
        depTaskExecutionXAxisLast.value = arrLast.map(x => x.depName)
        // 任务数
        const { abnormalTaskNum, expiredTaskNum, overTimeTaskNum, totalTaskNum, totalTaskNumRatio } = await cubeMaintainService.taskExecutionAnalysis({ period: props.time.value })
        taskExecution.value[0].value = totalTaskNum
        taskExecution.value[1].value = overTimeTaskNum
        taskExecution.value[2].value = expiredTaskNum
        taskExecution.value[3].value = abnormalTaskNum
        totalRatio.value = totalTaskNumRatio
        // 任务时长分析
        taskTimeData.value = await cubeMaintainService.taskTimeAnalysis({ period: props.time.value })
        taskTimeBarData.value[0].data = taskTimeData.value.taskTypeTime.map((x: { taskTimeHour: number; }) => x.taskTimeHour)
        // 稽查分析
        const { totalCheckTaskNum, totalCheckTaskNumRatio, top5Match, last5Match } = await cubeMaintainService.analysisOfAuditResults({ period: props.time.value })
        analysisOfAuditData.totalCheckTaskNum = totalCheckTaskNum
        analysisOfAuditData.totalCheckTaskNumRatio = totalCheckTaskNumRatio
        analysisOfAuditTop5.value = top5Match
        analysisOfAuditLast5.value = last5Match
        rankLastData.value = last5Match.map((x, i) => {
          return {
            rank: (i + 1).toString(),
            taskName: x.taskName,
            releaseTime: x.releaseTime,
            dutyOfficer: x.dutyOfficer,
            matchRatio: x.matchRatio,
            notMatchNum: x.notMatchNum
          }
        })
        rankTopData.value = last5Match.map((x, i) => {
          return {
            rank: (i + 1).toString(),
            taskName: x.taskName,
            releaseTime: x.releaseTime,
            dutyOfficer: x.dutyOfficer,
            matchRatio: x.matchRatio,
            notMatchNum: x.notMatchNum
          }
        })
      } catch (err) {
        showNotify({ type: 'danger', message: '请求错误' })
      }
    }
    watch(() => props.time, () => {
      if (props.activeTab === 'execute') {
        initData()
      }
    }, { deep: true, immediate: true })
    watch(() => props.activeTab, () => {
      if (props.activeTab === 'execute') {
        initData()
      }
    })
    return (): VNode =>
      <div class={styles.execute}>
        <div class={styles.total}>
          {
            taskExecution.value.map(x =>
              <div class={styles.item} key={x.label}>
                <span>{x.label}</span>
                <span style={{ fontSize: '16px', color: '#1F3140', fontWeight: '500' }}>{x.value}</span>
              </div>)
          }
          <p class={styles.description}>
            截止到目前，一共下发了<span>{taskExecution.value[0].value}</span>个巡检任务，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={totalRatio.value.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${totalRatio.value.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{totalRatio.value}</span>
          </p>
        </div>
        <div class={styles.bar}>
          <p>部门任务完成情况</p>
          <div style={{ width: '96vw', height: '200px' }}>
            {
              depTaskExecutionXAxis.value?.length > 0
                ? <StackBar xAxis={depTaskExecutionXAxis.value} data={depTaskExecutionList.value} />
                : <Empty />
            }
          </div>
        </div>
        <div class={styles.bar}>
          <p class={styles.description}>
            <span>{depTaskExecutionNum.maxTaskNumDep}</span>完成的任务最多，共完成了<span>{depTaskExecutionNum.maxTaskNum}</span>个，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={depTaskExecutionNum.maxTaskNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${depTaskExecutionNum.maxTaskNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{depTaskExecutionNum.maxTaskNumRatio};</span>
            <span>{depTaskExecutionNum.maxTaskRatioDep}</span>任务完成率最高，完成率在<span>{depTaskExecutionNum.maxTaskRatio}</span>，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={depTaskExecutionNum.maxTaskRatioRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${depTaskExecutionNum.maxTaskRatioRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{depTaskExecutionNum.maxTaskRatioRatio}；</span>
          </p>
          <p>部门巡检任务Top5</p>
          <div style={{ width: '96vw', height: '200px' }}>
            {
              depTaskExecutionXAxis.value?.length > 0
                ? <BaseBar xAxis={depTaskExecutionXAxis.value} data={taskTop5.value} />
                : <Empty />
            }
          </div>
        </div>
        <div class={styles.bar}>
          <p class={styles.description}>
            <span>{depTaskExecutionNum.minTaskNumDep}</span>完成的任务最少，共完成了<span>{depTaskExecutionNum.minTaskNum}</span>个，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={depTaskExecutionNum.minTaskNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${depTaskExecutionNum.minTaskNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{depTaskExecutionNum.minTaskNumRatio}；</span>
            <span>{depTaskExecutionNum.minTaskRatioDep}</span>任务完成率最低，完成率在<span>{depTaskExecutionNum.minTaskRatio}</span>，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={depTaskExecutionNum.minTaskRatioRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${depTaskExecutionNum.minTaskRatioRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{depTaskExecutionNum.minTaskRatioRatio}；</span>
          </p>
          <p>部门巡检任务Last5</p>
          <div style={{ width: '96vw', height: '200px' }}>
            {
              depTaskExecutionXAxisLast.value?.length > 0
                ? <BaseBar xAxis={depTaskExecutionXAxisLast.value} data={taskLast5.value} />
                : <Empty />
            }
          </div>
          <p class={styles.description}>
            截止到目前，巡检一共花了<span>{taskTimeData.value?.totalElapsedTime}</span>个小时，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={taskTimeData.value?.totalElapsedTimeRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${taskTimeData.value?.totalElapsedTimeRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{taskTimeData.value?.totalElapsedTimeRatio}；</span>
            其中<span>{taskTimeData.value?.taskTypeTime?.[0]?.inspectionType}</span>任务耗时最多，一共有<span>{taskTimeData.value?.taskTypeTime?.[0]?.taskTimeHour}</span>个小时，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={taskTimeData.value?.taskTypeTime?.[0]?.taskTimeRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${taskTimeData.value?.taskTypeTime?.[0]?.taskTimeRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{taskTimeData.value?.taskTypeTime?.[0]?.taskTimeRatio}；</span>
            <span>{taskTimeData.value?.taskTypeTime?.[taskTimeData.value?.taskTypeTime.length - 1]?.inspectionType}</span>
            耗时最少，一共有<span>{taskTimeData.value?.taskTypeTime?.[taskTimeData.value?.taskTypeTime.length - 1]?.taskTimeHour}</span>小时，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={taskTimeData.value?.taskTypeTime?.[taskTimeData.value?.taskTypeTime.length - 1]?.taskTimeRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${taskTimeData.value?.taskTypeTime?.[taskTimeData.value?.taskTypeTime.length - 1]?.taskTimeRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{taskTimeData.value?.taskTypeTime?.[taskTimeData.value?.taskTypeTime.length - 1]?.taskTimeRatio}；</span>
          </p>
          <div style={{ width: '96vw', height: '200px' }}>
            {taskTimeData.value?.taskTypeTime.length > 0
              ? <BaseBar
                xAxis={taskTimeData.value?.taskTypeTime.map((x: { inspectionType: string; }) => x.inspectionType)}
                data={taskTimeBarData.value}
              />
              : <Empty />}

          </div>
          <p class={styles.description}>
            截止到目前，一共下发了<span>{analysisOfAuditData.totalCheckTaskNum}</span>个巡检任务，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={analysisOfAuditData.totalCheckTaskNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${analysisOfAuditData.totalCheckTaskNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{analysisOfAuditData.totalCheckTaskNumRatio}，</span>
            其中由<span>{analysisOfAuditTop5.value?.[0]?.dutyOfficer}</span>
            负责的<span>{analysisOfAuditTop5.value?.[0]?.taskName}</span>，稽查结果匹配率最高，稽查结果匹配率为
            <span>{analysisOfAuditTop5.value?.[0]?.matchRatio}</span>；
          </p>
        </div>
        <div class={styles.table}>
          <p>稽查匹配率Top5</p>
          {
            rankTopData.value?.length > 0
              ? <Rank
                border
                head={rankHead}
                data={rankTopData.value}
              />
              : <Empty />
          }
          <p class={styles.description}>
            由<span>{analysisOfAuditLast5.value?.[0]?.dutyOfficer}</span>负责的
            <span>{analysisOfAuditLast5.value?.[0]?.taskName}</span>，匹配率最低，稽查结果匹配率为
            <span>{analysisOfAuditLast5.value?.[0]?.matchRatio}</span>；
          </p>
        </div>
        <div class={styles.table}>
          <p>稽查匹配率Last5</p>
          {
            rankTopData.value?.length > 0
              ? <Rank
                border
                head={rankHead}
                data={rankLastData.value}
              />
              : <Empty />
          }
        </div>
      </div>
  }
})
