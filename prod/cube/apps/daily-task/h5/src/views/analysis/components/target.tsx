import { defineComponent, ref, watch, type VNode } from 'vue'
import styles from './analysis.module.less'
import { getAssetsFile } from '@/utils'
import { Empty, Icon, Picker, Popup, showNotify } from 'vant'
import { cubeMaintainService } from '@/api/server'
import { BaseBar } from '@/components/echart/base-bar'
interface TargetType {
  label: string;
  targetCategory: string;
  details: {
    name: string;
    num: number;
    proportion: string;
  }[];
}
/** 巡检对象 */
export const Target = defineComponent({
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
    const targetType = ref<TargetType[]>([
      { label: '设备巡检', targetCategory: 'DEVICE', details: [] },
      { label: '资产巡检', targetCategory: 'PROPERTY', details: [] },
      { label: '档位巡检', targetCategory: 'STALL', details: [] },
      { label: '现场点巡检', targetCategory: 'SITE_POINT', details: [] },
      { label: '风险源巡检', targetCategory: 'RISK_SOURCE', details: [] },
    ])
    const inspectionObj = ref(
      {
        totalInspectionNum: 0,
        totalInspectionNumRatio: '0.00%',
        maxNumObj: '',
        maxNum: 0,
        maxNumRatio: '0.00%',
        minNumObj: '',
        minNum: 0,
        minNumRatio: '0.00%'
      }
    )
    const inspectionObjTask = ref(
      {
        inspectionTaskTotalNum: 0,
        maxTaskNumObj: '',
        maxTaskNum: 0,
        maxTaskNumRatio: '',
        minTaskNumObj: '',
        minTaskNum: 0,
        minTaskNumRatio: ''
      }
    )
    const inspectionTop10 = ref<{ name: string; data: number[];xAxis: string[]; }[]>([
      { name: '巡检对象次数', data: [], xAxis: [] },
    ])
    const abnormalNumTop10 = ref<{ name: string; data: number[];xAxis: string[]; }[]>([
      { name: '巡检对象异常次数', data: [], xAxis: [] },
    ])
    const taskTop10 = ref<{ name: string; data: number[];xAxis: string[]; }[]>([
      { name: '巡检任务数Top', data: [], xAxis: [] },
    ])
    const taskLast10 = ref<{ name: string; data: number[];xAxis: string[]; }[]>([
      { name: '巡检任务数Last', data: [], xAxis: [] },
    ])
    const objAbnormal = ref({
      abnormalObjNum: 0,
      abnormalObjNumRatio: '',
      maxAbnormalObj: '',
      maxAbnormalObjNum: 0,
      maxAbnormalObjNumRatio: '',
      minAbnormalObj: '',
      minAbnormalObjNum: 0,
      minAbnormalObjNumRatio: ''
    })
    const typeOptions = [
      { name: 'DEVICE', title: '设备' },
      { name: 'STALL', title: '档位' },
      { name: 'PROPERTY', title: '资产' },
      { name: 'SITE_POINT', title: '现场点' },
      { name: 'RISK_SOURCE', title: '风险源' },
      { name: 'PATROL_POINT', title: '巡更点' },
    ]
    const currentPop = ref('')
    const numTop10Type = ref()
    const abnormalNumTopType = ref()
    const taskTop10Type = ref()
    const taskLast10Type = ref()
    // 巡检次数Top10
    const getInspectionTop10 = async (objType?: string): Promise<void> => {
      try {
        const objInspectionNumTop = await cubeMaintainService.objInspectionNumTop({ period: props.time.value, objType })
        inspectionTop10.value[0].data = objInspectionNumTop.map(x => x.inspectionNum)
        inspectionTop10.value[0].xAxis = objInspectionNumTop.map(x => x.objName)
      } catch (err) {
        showNotify({ type: 'danger', message: '请求错误' })
      }
    }
    // 异常项数Top10
    const getAbnormalNumTop = async (objType?: string): Promise<void> => {
      try {
        const objInspectionNumTop = await cubeMaintainService.objAbnormalNumTop({ period: props.time.value, objType })
        abnormalNumTop10.value[0].data = objInspectionNumTop.map(x => x.inspectionNum)
        abnormalNumTop10.value[0].xAxis = objInspectionNumTop.map(x => x.objName)
      } catch (err) {
        showNotify({ type: 'danger', message: '请求错误' })
      }
    }
    // 任务数Top10
    const getTaskTop10 = async (objType?: string): Promise<void> => {
      try {
        const taskNumTop = await cubeMaintainService.objInspectionTaskTop({ period: props.time.value, objType })
        taskTop10.value[0].data = taskNumTop.map(x => x.inspectionNum)
        taskTop10.value[0].xAxis = taskNumTop.map(x => x.objName)
      } catch (err) {
        showNotify({ type: 'danger', message: '请求错误' })
      }
    }
    // 任务数Last10
    const getTaskLast10 = async (objType?: string): Promise<void> => {
      try {
        const taskNumLast = await cubeMaintainService.objInspectionTaskLast({ period: props.time.value, objType })
        taskLast10.value[0].data = taskNumLast.map(x => x.inspectionNum)
        taskLast10.value[0].xAxis = taskNumLast.map(x => x.objName)
      } catch (err) {
        showNotify({ type: 'danger', message: '请求错误' })
      }
    }
    const changeType = async (item: { name: string;title: string; }[]): Promise<void> => {
      switch (currentPop.value) {
        case 'numTop10Type':
          numTop10Type.value = item[0].title
          getInspectionTop10(item[0].name)
          break
        case 'abnormalNumTopType':
          abnormalNumTopType.value = item[0].title
          getAbnormalNumTop(item[0].name)
          break
        case 'taskTop10Type':
          taskTop10Type.value = item[0].title
          getTaskTop10(item[0].name)
          break
        case 'taskLast10Type':
          taskLast10Type.value = item[0].title
          getTaskLast10(item[0].name)
          break
      }
    }
    const showPicker = ref(false)

    const initData = async (): Promise<void> => {
      try {
        // 巡检统计
        const category = await cubeMaintainService.getTargetCategory({ period: props.time.value })
        targetType.value.forEach(x => {
          const type = category.find(item => item.targetCategory === x.targetCategory)
          if (type) {
            x.details = [...type.details]
          }
        })
        inspectionObj.value = await cubeMaintainService.inspectionObjAnalysis({ period: props.time.value })
        getInspectionTop10()
        getAbnormalNumTop()
        getTaskTop10()
        getTaskLast10()
        inspectionObjTask.value = await cubeMaintainService.inspectionObjTaskAnalysis({ period: props.time.value })
        // 异常统计
        objAbnormal.value = await cubeMaintainService.inspectionObjAbnormalAnalysis({ period: props.time.value })
      } catch (err) {
        showNotify({ type: 'danger', message: '请求错误' })
      }
    }

    watch(() => props.time, () => {
      abnormalNumTopType.value = ''
      numTop10Type.value = ''
      taskTop10Type.value = ''
      taskLast10Type.value = ''
      if (props.activeTab === 'target') {
        initData()
      }
    }, { deep: true, immediate: true })
    watch(() => props.activeTab, () => {
      abnormalNumTopType.value = ''
      numTop10Type.value = ''
      taskTop10Type.value = ''
      taskLast10Type.value = ''
      if (props.activeTab === 'target') {
        initData()
      }
    })
    return (): VNode =>
      <div class={styles.target}>
        <div class={styles['target-type']}>
          {
            targetType.value.map(x =>
              <div class={styles.item} key={x.label}>
                <div class={styles.title}>{x.label}</div>
                <div class={styles.content}>
                  <p><span>巡检次数：</span><span>{x.details.find(x => x.name === 'inspection')?.num}</span></p>
                  <p><span>次数占比：</span><span>{x.details.find(x => x.name === 'inspection')?.proportion}</span> </p>
                  <p><span>异常次数：</span><span>{x.details.find(x => x.name === 'abnormal')?.num}</span> </p>
                  <p><span>异常次数占比：</span><span>{x.details.find(x => x.name === 'abnormal')?.proportion}</span></p>
                  <p><span>任务数：</span><span>{x.details.find(x => x.name === 'task')?.num}</span> </p>
                  <p><span>任务数占比：</span><span>{x.details.find(x => x.name === 'task')?.proportion}</span></p>
                </div>
              </div>)
          }
          <p class={styles.description}>
            在此期间，巡检次数一共有<span>{inspectionObj.value.totalInspectionNum}</span>次，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={inspectionObj.value.totalInspectionNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${inspectionObj.value.totalInspectionNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{inspectionObj.value.totalInspectionNumRatio}；</span>
            其中<span>{inspectionObj.value.maxNumObj}</span>
            巡检次数最多有<span>{inspectionObj.value.maxNum}</span>次，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={inspectionObj.value.maxNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${inspectionObj.value.maxNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{inspectionObj.value.totalInspectionNumRatio}；</span>
            其中<span>{inspectionObj.value.minNumObj}</span>
            巡检次数最少有<span>{inspectionObj.value.minNum}</span>次，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={inspectionObj.value.minNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${inspectionObj.value.minNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{inspectionObj.value.minNumRatio}；</span>
          </p>
        </div>
        <div class={styles.bar}>
          <p class={styles.title}>对象巡检次数排名Top10
            <div class={styles.type}>
              <div onClick={() => {
                showPicker.value = true; currentPop.value = 'numTop10Type'
              }}>
                {
                  numTop10Type.value
                    ? <span style='color:var(--van-primary-color)'>{numTop10Type.value}</span>
                    : <span style='color:#999999'>对象类型</span>
                }
                <Icon name='arrow-down' color='var(--van-primary-color)' />
              </div>
            </div>
          </p>
          <div style={{ width: '96vw', height: '200px' }}>
            {
              inspectionTop10.value[0].xAxis.length > 0
                ? <BaseBar
                  xAxis={inspectionTop10.value[0].xAxis}
                  data={inspectionTop10.value}
                  rotate={45}
                  grid={{
                    top: '20px',
                    left: '50px',
                    right: '20px',
                    bottom: '60px',
                  }}
                />
                : <Empty />
            }
          </div>
          <p class={styles.description}>
            在此期间，对象异常项一共有<span>{objAbnormal.value.abnormalObjNum}</span>次，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={objAbnormal.value.abnormalObjNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${objAbnormal.value.abnormalObjNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{objAbnormal.value.abnormalObjNumRatio}；</span>
            其中<span>{objAbnormal.value.maxAbnormalObj}</span>巡检异常最多有<span>{objAbnormal.value.maxAbnormalObjNum}</span>次，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={objAbnormal.value.maxAbnormalObjNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${objAbnormal.value.maxAbnormalObjNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{objAbnormal.value.maxAbnormalObjNumRatio}；</span>
            其中<span>{objAbnormal.value.minAbnormalObj}</span>巡检异常最少有<span>{objAbnormal.value.minAbnormalObjNum}</span>次，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={objAbnormal.value.minAbnormalObjNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${objAbnormal.value.minAbnormalObjNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{objAbnormal.value.minAbnormalObjNumRatio}；</span>
          </p>
        </div>
        <div class={styles.bar}>
          <p class={styles.title}>对象巡检异常项数排名Top10
            <div class={styles.type}>
              <div onClick={() => {
                showPicker.value = true; currentPop.value = 'abnormalNumTopType'
              }}>
                {
                  abnormalNumTopType.value
                    ? <span style='color:var(--van-primary-color)'>{abnormalNumTopType.value}</span>
                    : <span style='color:#999999'>对象类型</span>
                }
                <Icon name='arrow-down' color='var(--van-primary-color)' />
              </div>
            </div>
          </p>
          <div style={{ width: '96vw', height: '200px' }}>
            {
              abnormalNumTop10.value[0].xAxis.length > 0
                ? <BaseBar
                  xAxis={abnormalNumTop10.value[0].xAxis}
                  data={abnormalNumTop10.value}
                  rotate={45}
                  grid={{
                    top: '20px',
                    left: '50px',
                    right: '20px',
                    bottom: '60px',
                  }}
                />
                : <Empty />
            }
          </div>
          <p class={styles.description}>
            在此期间，巡检任务一共有<span>{inspectionObjTask.value.inspectionTaskTotalNum}</span>
            次，其中针对<span>{inspectionObjTask.value.maxTaskNumObj}</span>下发的巡检任务数最多有
            <span>{inspectionObjTask.value.maxTaskNum}</span>个，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={inspectionObjTask.value.maxTaskNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${inspectionObjTask.value.maxTaskNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{inspectionObjTask.value.maxTaskNumRatio}；</span>
            针对<span>{inspectionObjTask.value.minTaskNumObj}</span>下发的巡检任务数最少有<span>{inspectionObjTask.value.minTaskNum}</span>个，环比
            <img
              width='12'
              style={{ background: 'rgba(0,0,0,0)' }}
              src={inspectionObjTask.value.minTaskNumRatio.includes('-') ? getAssetsFile('ic_trend_down.svg') : getAssetsFile('ic_trend_up.svg')} alt=''
            />
            <span style={{ fontSize: '12px', color: `${inspectionObjTask.value.minTaskNumRatio.includes('-') ? 'green' : 'red'}`, marginTop: '20px' }}>{inspectionObjTask.value.minTaskNumRatio}；</span>
          </p>
        </div>
        <div class={styles.bar}>
          <p class={styles.title}>对象巡检任务数Top10
            <div class={styles.type}>
              <div onClick={() => {
                showPicker.value = true; currentPop.value = 'taskTop10Type'
              }}>
                {
                  taskTop10Type.value
                    ? <span style='color:var(--van-primary-color)'>{taskTop10Type.value}</span>
                    : <span style='color:#999999'>对象类型</span>
                }
                <Icon name='arrow-down' color='var(--van-primary-color)' />
              </div>
            </div>
          </p>
          <div style={{ width: '96vw', height: '200px' }}>
            {
              taskTop10.value[0].xAxis.length > 0
                ? <BaseBar
                  xAxis={taskTop10.value[0].xAxis}
                  data={taskTop10.value}
                  rotate={45}
                  grid={{
                    top: '20px',
                    left: '50px',
                    right: '20px',
                    bottom: '60px',
                  }}
                />
                : <Empty />
            }
          </div>
        </div>
        <div class={styles.bar}>
          <p class={styles.title}>对象巡检任务数Last10
            <div class={styles.type}>
              <div onClick={() => {
                showPicker.value = true; currentPop.value = 'taskLast10Type'
              }}>
                {
                  taskLast10Type.value
                    ? <span style='color:var(--van-primary-color)'>{taskLast10Type.value}</span>
                    : <span style='color:#999999'>对象类型</span>
                }
                <Icon name='arrow-down' color='var(--van-primary-color)' />
              </div>
            </div>
          </p>
          <div style={{ width: '96vw', height: '200px' }}>
            {
              taskLast10.value[0].xAxis.length > 0
                ? <BaseBar
                  xAxis={taskLast10.value[0].xAxis}
                  data={taskLast10.value}
                  rotate={45}
                  grid={{
                    top: '20px',
                    left: '50px',
                    right: '20px',
                    bottom: '60px',
                  }}
                />
                : <Empty />
            }
          </div>
        </div>
        <Popup v-model:show={showPicker.value} round position='bottom'>
          <Picker
            columns={typeOptions}
            columns-field-names={{
              text: 'title',
              value: 'name',
            }}
            onConfirm={({ selectedOptions }: { selectedOptions: { title: string;name: string; }[]; }) => {
              changeType(selectedOptions)
              showPicker.value = false
            }}
            onCancel={() => {
              showPicker.value = false
            }}
          />
        </Popup>
      </div>
  }
})
