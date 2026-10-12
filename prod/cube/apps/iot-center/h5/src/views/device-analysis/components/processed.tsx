import { defineComponent, ref, watch } from 'vue'
import styles from './alarm.module.less'
import { Cell, Empty, Picker, Popup } from 'vant'
import { Bar } from '../../../components/echart/bar'
import { Rank } from '../../../components/echart/rank'
import { cubeAlarmCenterService } from '@/api/server'
import type { EfficiencyTenAnalysis } from '@ghcloud/cube-alarm-center-service/src/type'
export const Processed = defineComponent({
  props: {
    processedData: {
      type: Object,
      default: () => {
        return {
          handlerAnalysis: {},
          levelHandlerEfficiency: {},
          efficiencyLastTen: [],
          efficiencyTopTen: [],
          levelList: []
        }
      }
    },
    applicationCode: {
      type: String,
      default: ''
    },
    period: {
      type: String,
      default: ''
    },
  },
  setup (props) {
    const levelHandlerEfficiency = ref()
    const efficiencyLastTen = ref<EfficiencyTenAnalysis[]>([])
    const efficiencyTopTen = ref<EfficiencyTenAnalysis[]>([])
    const currentLevel = ref('')
    watch(() => props.processedData, () => {
      levelHandlerEfficiency.value = props.processedData.levelHandlerEfficiency ?? []
      efficiencyLastTen.value = props.processedData.efficiencyLastTen ?? []
      efficiencyTopTen.value = props.processedData.efficiencyTopTen ?? []
      currentLevel.value = props.processedData.levelList?.[0]?.name
    }, { deep: true, immediate: true })
   
    const showPicker = ref(false)
    const changeLevel = async (item: { name: string;id: string; }[]): Promise<void> => {
      currentLevel.value = item[0]?.name
      levelHandlerEfficiency.value = await cubeAlarmCenterService.getLevelHandlerEfficiencyAnalysis({ applicationCode: props.applicationCode, period: props.period, alarmLevelId: item[0]?.id })
      efficiencyLastTen.value = await cubeAlarmCenterService.getEfficiencyLastTenAnalysis({ applicationCode: props.applicationCode, period: props.period, alarmLevelId: item[0]?.id })
      efficiencyTopTen.value = await cubeAlarmCenterService.getEfficiencyTopTenAnalysis({ applicationCode: props.applicationCode, period: props.period, alarmLevelId: item[0]?.id })
    }
    return (): JSX.Element =>
      <div>
        <Cell style={{ paddingBottom: '4px' }}>
          <div class={styles['cell-title']}>报警处理分析</div>
        </Cell>
        <Cell border={false}>
          <div class={styles.content}>
            <div class={styles.head}>
              已处理报警<span class={styles.blue}>{props.processedData.handlerAnalysis.alarmHandlerTotalNum}</span>个，
              还有<span class={styles.red}>{props.processedData.handlerAnalysis.alarmUnresolvedHandlerTotalNum}</span>个报警待解决，
              <span class={styles.black}>{props.processedData.handlerAnalysis.alarmHandlerTopThreeUserNames}</span>处理的报警数量最多
            </div>
            <p style={{ color: '#1F3140', textAlign: 'left', marginTop: '10px' }}>处理报警数排名Top10</p>
            <div class={styles.echart}>
              {
                props.processedData.handlerAnalysis.topTenUserHandlerStatisticsVOS?.length > 0
                  ? <Bar 
                    rotate={50}
                    grid={{
                      top: '20px',
                      left: '30px',
                      right: '20px',
                      bottom: '60px'
                    }}
                    data={props.processedData.handlerAnalysis.topTenUserHandlerStatisticsVOS?.map((x: { alarmHandlerTotalNum: number; }) => x.alarmHandlerTotalNum)}
                    xAxis={props.processedData.handlerAnalysis.topTenUserHandlerStatisticsVOS?.map((x: { name: string; }) => x.name)}
                  />
                  : <Empty />
              }
            </div>
            <div />
          </div>
          <div class={styles.content}>
            <p style={{ color: '#1F3140', textAlign: 'left', marginTop: '10px' }}>处理报警数倒数排名Bot10</p>
            <div>
              {
                props.processedData.handlerAnalysis.lastTopTenUserHandlerStatisticsVOS?.length > 0
                  ? <Rank 
                    head={[{ title: '排名', key: 'rank' }, { title: '处理人', key: 'person' }, { title: '处理报警数(个)', key: 'num' }]} 
                    data={props.processedData.handlerAnalysis.lastTopTenUserHandlerStatisticsVOS?.map((x: { name: string; alarmHandlerTotalNum: number; }, i: number) => {
                      return { rank: i + 1, person: x.name, num: x.alarmHandlerTotalNum }
                    })}
                  />
                  : <Empty />
              }
            </div>
            <div />
          </div>
          <div class={styles.content}>
            <p style={{ color: '#1F3140', textAlign: 'left', marginTop: '10px' }}>报警处理效率排名Top10</p>
            <div class={styles.head}>
              <span class={styles.black}>{levelHandlerEfficiency.value?.[0]?.highEfficiencyUserName}</span>处理
              <span class={styles.black}>{levelHandlerEfficiency.value?.[0]?.name}</span>效率最高，
              <span class={styles.black}>{levelHandlerEfficiency.value?.[0]?.lowEfficiencyUserName}</span>处理
              <span class={styles.black}>{levelHandlerEfficiency.value?.[0]?.name}</span>效率最低
            </div>
            <div class={styles.level}>
              <div onClick={() => {
                showPicker.value = true 
              }}>{currentLevel.value ?? '请选择'}</div>
            </div>
            <Popup v-model:show={showPicker.value} round position='bottom'>
              <Picker
                columns={props.processedData.levelList} 
                columns-field-names={{
                  text: 'name',
                  value: 'id',
                }}
                onConfirm={({ selectedOptions }: { selectedOptions: { id: string;name: string; }[]; }) => {
                  changeLevel(selectedOptions)
                  showPicker.value = false
                }} 
                onCancel={() => {
                  showPicker.value = false
                }}
              />
            </Popup>
            <div class={styles.echart}>
              {
                efficiencyTopTen.value?.length > 0
                  ? <Bar
                    name='平均耗时(分)' rotate={50}
                    grid={{
                      top: '20px',
                      left: '30px',
                      right: '20px',
                      bottom: '60px'
                    }}
                    data={efficiencyTopTen.value?.map((x: EfficiencyTenAnalysis) => x.avgProcessMinutes)}
                    xAxis={efficiencyTopTen.value?.map((x: EfficiencyTenAnalysis) => x.alarmHandlerName)}
                  />
                  : <Empty />
              }
            </div>
            <div />
          </div>
          <div class={styles.content}>
            <p style={{ color: '#1F3140', textAlign: 'left', marginTop: '10px' }}>报警处理效率倒数排名Bot10</p>
            <div>
              {
                efficiencyLastTen.value?.length > 0
                  ? <Rank 
                    head={[{ title: '排名', key: 'rank' }, { title: '处理人', key: 'person' }, { title: '处理耗时(分钟)', key: 'time' }]} 
                    data={efficiencyLastTen.value?.map((x: EfficiencyTenAnalysis, i: number) => {
                      return { rank: i + 1, person: x.alarmHandlerName, time: x.avgProcessMinutes }
                    })}
                  />
                  : <Empty />
              }
            </div>
            <div />
          </div>
        </Cell>
      </div>
  }
})
