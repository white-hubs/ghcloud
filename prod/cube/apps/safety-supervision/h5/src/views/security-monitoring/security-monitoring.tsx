
import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import Pie from '@/components/charts/pie/pie'
import PlanList from '@/components/charts/pie-list/pie-list'
import './security-monitoring.model.less'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import { Empty, PullRefresh } from 'vant'
import { DatePickerSelector } from '@/components/date-picker-select'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { Rank } from '@/components/rank/rank'
import { cubeSafetyManagementAlarmService, cubeSafetySupervisionAlarmHandleService } from '@/api/server'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { storeMarket } from '@/store/market'
import { useRouteQuery } from '@/hooks/use-route-query'
export const SecurityMonitoring = defineComponent({
  setup: () => {
    const colorList = ['#2989FF', '#00B358', '#FFAA00', '#1D66FF', '#FFC700', '#74AEE7', '#00F27B', '#29C2FF', '#2AE8BD', '#3590FF', '#19F8F7', '#EF424A', '#c4ceda', '#8c8f96']
    const { timeType, period } = useRouteQuery()
    const eventProportionData = ref([
      {
        label: '事件类型1',
        color: '#2989FF',
        value: 10,
        ratio: '10',
      },
    ])
    const loading = ref(false)
    const alarmRanking = ref<{ name: string; value: number; }[]>([])
    const alarmRankRate = ref([
      { title: '响应率', count: 0, field: 'response', ratio: 10, unit: '%' },
      { title: '处理率', count: 0, field: 'handled', ratio: -10, unit: '%' },
      { title: '超时率', count: 0, field: 'timeout', ratio: -10, unit: '%' }
    ])
    const alarmStatus = ref([
      {
        title: '安防报警数', count: 3455, ratio: 10
      }
    ])
    const alarmAccuracy = ref([
      {
        title: '明火报警', count: 3455, ratio: 10
      }
    ])
    const alarmTrendData = reactive<{
      CategoryData: string[];
      series: number[];
    }>({
      CategoryData: [],
      series: []
    })
    const marketStore = storeMarket()
    type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
    const handleChangeDate = (value: { start: string;end: string; }, active: SelectType): void => {
      period.value = value.start + ',' + value.end
      timeType.value = active
      getAlarmStatisticsGroup()
      getAlarmEventTypeRatio()
      getAlarmEventActualRatio()
      getAlarmTrendAnalysis()
      alarmHandleRate()
      alarmHandleRank()
    }
    const getAlarmStatisticsGroup = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmStatisticsGroup({ applicationCode: ApplicationCode.MONITORING, period: period.value, marketTenants: [marketStore.currentMarket] })
      alarmStatus.value = res.map(item => {
        return {
          title: item.statusName === '报警数' ? '安防' + item.statusName : item.statusName,
          count: item.totalNum,
          ratio: item.ratio,
          field: item
        }
      })
    }
    /** 报警处理 响应率 超时率 处理率 */
    const alarmHandleRate = async (): Promise<void> => {
      try {
        const params = {
          applicationCodes: [ApplicationCode.MONITORING],
          createdPeriod: period.value,
          marketTenantIDs: marketStore.currentMarket ? [marketStore.currentMarket] : []
        }
        await Promise.all([
          cubeSafetySupervisionAlarmHandleService.getAlarmHandleTimeOutRate(params).then(res => {
            alarmRankRate.value[2].count = res.rate
            alarmRankRate.value[2].ratio = res.qoq
          }),
          cubeSafetySupervisionAlarmHandleService.getAlarmHandlerRate(params).then(res => {
            alarmRankRate.value[1].count = res.rate
            alarmRankRate.value[1].ratio = res.qoq
          }),
          cubeSafetySupervisionAlarmHandleService.getAlarmHandleResponseRate(params).then(res => {
            alarmRankRate.value[0].count = res.rate
            alarmRankRate.value[0].ratio = res.qoq
          })
        ])
      } catch {

      }
    }
    const getAlarmEventTypeRatio = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmEventTypeRatio({ applicationCode: ApplicationCode.MONITORING, period: period.value, marketTenants: [marketStore.currentMarket] })
      eventProportionData.value = res.map((item, index) => {
        return {
          id: item.id,
          label: item.name,
          color: colorList[index],
          value: item.totalNum,
          ratio: item.ratio
        }
      })
    }
    const getAlarmEventActualRatio = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmEventActualRatio({ applicationCode: ApplicationCode.MONITORING, period: period.value, marketTenants: [marketStore.currentMarket] })
      alarmAccuracy.value = res.map(item => {
        return {
          title: item.name,
          count: item.actualRatio,
          ratio: item.ratio,
          unit: '%'
        }
      })
    }
    const getAlarmTrendAnalysis = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmTrendAnalysis({ applicationCode: ApplicationCode.MONITORING, period: period.value, type: timeType.value, marketTenants: [marketStore.currentMarket] })
      if (timeType.value === 'TODAY') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '时'
        })
      } else if (timeType.value === 'THIS_WEEK') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '日'
        })
      } else if (timeType.value === 'THIS_MONTH') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '日'
        })
      } else if (timeType.value === 'THIS_YEAR') {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period + '月'
        })
      } else {
        alarmTrendData.CategoryData = res.alarmTrends.map(item => {
          return item.period
        })
      }
      alarmTrendData.series = res.alarmTrends.map(item => {
        return item.totalNum
      })
    }
    /** 报警处理 市场排名 维度 */
    const alarmHandleType = ref<'response' | 'timeout' | 'handled'>('response')
    /** 报警处理 市场排名 */
    const alarmHandleRank = async (type?: 'response' | 'timeout' | 'handled'): Promise<void> => {
      type && (alarmHandleType.value = type)
      const res = await cubeSafetySupervisionAlarmHandleService.getMarketRankByMetric({
        metric: alarmHandleType.value,
        applicationCodes: [ApplicationCode.MONITORING],
        createdPeriod: JSON.parse(JSON.stringify(period.value)).replace(/\//g, '-'),
        marketTenantIDs: marketStore.currentMarket ? [marketStore.currentMarket] : []
      })
      alarmRanking.value = res.map(e => {
        return {
          name: e.marketName,
          value: e.rate
        }
      })
    }
    const alarmEvent = (item: { status: string; }): void => {
      const params = {
        alarmStatus: item.status,
        startTime: period.value.split(',')[0],
        endTime: period.value.split(',')[1],
        marketTenant: marketStore.currentMarket,
        alarmTypeCode: 'SECURITY_MONITORING'
      }
      cubeAppService.toSafetyAlarmRecordPage(JSON.stringify(params))
    }
    const onRefresh = async (): Promise<void> => {
      loading.value = true
      await getAlarmStatisticsGroup()
      await getAlarmEventTypeRatio()
      await getAlarmEventActualRatio()
      await getAlarmTrendAnalysis()
      await alarmHandleRank()
      await alarmHandleRate()
      loading.value = false
    }
    const alarmTypeDrilling = (id: string): void => {
      const params = {
        alarmEventTypeCode: id,
        startTime: period.value.split(',')[0],
        endTime: period.value.split(',')[1],
        marketTenant: marketStore.currentMarket,
        alarmTypeCode: 'SECURITY_MONITORING'
      }
      cubeAppService.toSafetyAlarmRecordPage(JSON.stringify(params))
    }
    watch(() => marketStore.currentMarket, () => {
      onRefresh()
    })
    onMounted(() => {
      document.title = '安防监控'
      onRefresh()
    })
    return (): JSX.Element => (
      <>
        <div class='page'>
          <div style={{ marginBottom: '10px' }}><DatePickerSelector value={period.value.split(',')} selectType={timeType.value} onChange={handleChangeDate} /></div>
          <PullRefresh v-model={loading.value} onRefresh={onRefresh}>
            <div class='card'>
              <AlarmCountStatistics onChange={alarmEvent} disabled dataSource={alarmStatus.value} style={{ 'background-color': '#fff' }} />
            </div>
            <div class='card'>
              <div class='title'>报警事件占比</div>
              <div class='flex' v-show={eventProportionData.value.length}>
                <Pie pieData={eventProportionData.value} />
                <PlanList onChange={alarmTypeDrilling} roundPieData={eventProportionData.value} />
              </div>
              <Empty v-show={!eventProportionData.value.length} />
            </div>
            <div class='card'>
              <div class='title'>报警事件正确率</div>
              <AlarmCountStatistics disabled dataSource={alarmAccuracy.value} style={{ 'background-color': '#fff' }} />
            </div>
            <div class='card colorLinear'>
              <div class='title'>{marketStore.currentMarket ? '报警处理' : '报警处理排名'}</div>
              <AlarmCountStatistics dataSource={alarmRankRate.value} onChange={alarmHandleRank} currentActive={alarmHandleType.value} />
              {!marketStore.currentMarket && <Rank rankData={alarmRanking.value} maxValue={100} unit='%' />}
            </div>
            <div class='card'>
              <div class='title'>报警趋势</div>
              <LineChart CategoryData={alarmTrendData.CategoryData} series={alarmTrendData.series} />
            </div>
          </PullRefresh>
        </div>
      </>
    )
  }
})
