import { defineComponent, onMounted, reactive, ref, type VNode } from 'vue'
import { TimePicker } from '../../components/time-picker/time-picker'
import styles from './device-analysis.module.less'
import { CellGroup, Loading } from 'vant'
import { Basic } from './components/basic'
import { Alarm } from './components/alarm'
import { Processed } from './components/processed'
import { useRoute } from 'vue-router'
import { cubeAlarmCenterService, cubeSecurityService } from '@/api/server'
import { timePeriod } from '@/utils'
import type { AlarmAnalysisLevel, EfficiencyTenAnalysis } from '@ghcloud/cube-alarm-center-service/src/type'
import { useMetaTitle } from '@/hooks/use-meta-title-hook'
import { Bar } from '@/components/bar/bar'
export const DeviceAnalysis = defineComponent({
  setup () {
    const route = useRoute()
    useMetaTitle()
    const levelList = ref<AlarmAnalysisLevel[]>([])
    const time = reactive({ value: timePeriod(), name: 'TODAY' })

    const basicData = reactive({
      ringRatioAnalysis: {},
      statusList: {},
    })
    const alarmData = reactive({
      eventAnalysis: {},
      trendAnalysis: {},
      areaAnalysis: {},
    })
    const processedData = reactive({
      handlerAnalysis: {},
      levelHandlerEfficiency: {},
      efficiencyLastTen: [] as EfficiencyTenAnalysis[],
      efficiencyTopTen: [] as EfficiencyTenAnalysis[],
    })
    const applicationCode = route.query.applicationCode as string ?? ''
  
    const loading = ref(false)
    const initData = async (): Promise<void> => {
      loading.value = true
      try {
        levelList.value = await cubeAlarmCenterService.getAlarmStatisticsLevel({ applicationCode, period: time.value })
        const res = await Promise.all([
          await cubeAlarmCenterService.getEventAnalysis({ applicationCode, period: time.value }),
          await cubeAlarmCenterService.getTrendAnalysis({ applicationCode, period: time.value }),
          await cubeAlarmCenterService.getAreaAnalysis({ applicationCode, period: time.value }),
          await cubeAlarmCenterService.getAlarmHandleAnalysis({ applicationCode, period: time.value }),
          await cubeAlarmCenterService.getLevelHandlerEfficiencyAnalysis({ applicationCode, period: time.value, alarmLevelId: levelList.value[0]?.id }),
          await cubeAlarmCenterService.getEfficiencyLastTenAnalysis({ applicationCode, period: time.value, alarmLevelId: levelList.value[0]?.id }),
          await cubeAlarmCenterService.getEfficiencyTopTenAnalysis({ applicationCode, period: time.value, alarmLevelId: levelList.value[0]?.id }),
          await cubeAlarmCenterService.getAlarmStatisticsRingRatioAnalysis({ applicationCode, period: time.value, type: time.name }),
          await cubeSecurityService.getStatusList(applicationCode)
        ])
        alarmData.eventAnalysis = res[0]
        alarmData.trendAnalysis = res[1]
        alarmData.areaAnalysis = res[2]
        processedData.handlerAnalysis = res[3]
        processedData.levelHandlerEfficiency = res[4]
        processedData.efficiencyLastTen = res[5] 
        processedData.efficiencyTopTen = res[6]
        basicData.ringRatioAnalysis = res[7]
        basicData.statusList = res[8]
      } catch {
      } finally {
        loading.value = false
      }
    }
    const changeTime = (item: { value: string; name: string; }): void => {
      time.name = item.name
      time.value = item.value
      initData()
    }
    onMounted(() => {
      initData()
    })
    const dom = (): VNode =>
      <>
        <CellGroup inset class={styles['cell-group']}><Basic basicData={{ ...basicData, levelList: levelList.value }} /></CellGroup>
        <CellGroup inset class={styles['cell-group']}><Alarm alarmData={alarmData} /></CellGroup>
        <CellGroup inset class={styles['cell-group']}><Processed applicationCode={applicationCode} period={time.value} processedData={{ ...processedData, levelList: levelList.value }} /></CellGroup>
      </>
    return (): JSX.Element =>
      <>
        <Bar />
        <div class={styles.wrapper}>
          <TimePicker class={styles.time} onChange={changeTime} />
          <div class={styles.content}>
            {loading.value
              ? <Loading size='30px' type='spinner' vertical loading={loading.value} color='var(--van-primary-color)' />
              : dom()}
          </div>
        </div>
      </>
  }
})
