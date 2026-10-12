import { defineComponent, onMounted, reactive, ref, watch } from 'vue'
import Pie from '@/components/charts/pie/pie'
import PlanList from '@/components/charts/pie-list/pie-list'
import '../security-monitoring/security-monitoring.model.less'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import { Empty, PullRefresh } from 'vant'
import { DatePickerSelector } from '@/components/date-picker-select'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { Rank } from '@/components/rank/rank'
import { WorkSituation } from '@/components/work-situation'
import {
  cubeSafetyManagementAlarmService,
  cubeSafetySupervisionAlarmHandleService,
  cubeSafetySupervisionService
} from '@/api/server'
import { ApplicationCode } from '@ghcloud/cube-safety-supervision-service'
import { cubeAppService } from '@ghcloud/cube-app-js-sdk'
import { storeMarket } from '@/store/market'
import { useRouteQuery } from '@/hooks/use-route-query'
export const FireSafety = defineComponent({
  setup: () => {
    const { period, timeType } = useRouteQuery()
    const eventProportionData = ref<{
      label: string;
      color: string;
      value: number;
      ratio: string; }[]>([

    ])
    const alarmRanking = ref<{ name: string; value: number; }[]>([])
    const marketStore = storeMarket()
    const colorList = ['#2989FF', '#00B358', '#FFAA00', '#1D66FF', '#FFC700', '#74AEE7', '#00F27B', '#29C2FF', '#2AE8BD', '#3590FF', '#19F8F7', '#EF424A', '#c4ceda', '#8c8f96']
    const refreshLoading = ref(false)
    const onRefresh = async (): Promise<void> => {
      refreshLoading.value = true
      await getRiskCountStatus()
      await getDeviceCountStatus()
      await getAlarmStatisticsGroup()
      await getAlarmEventTypeRatio()
      await getAlarmTrendAnalysis()
      await alarmHandleRank()
      await alarmHandleRate()
      refreshLoading.value = false
    }
    type SelectType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'
    const handleChangeDate = (value: { start: string;end: string; }, active: SelectType): void => {
      period.value = value.start + ',' + value.end
      timeType.value = active
      getRiskCountStatus()
      getDeviceCountStatus()
      getAlarmStatisticsGroup()
      getAlarmEventTypeRatio()
      getAlarmTrendAnalysis()
      alarmHandleRank()
      alarmHandleRate()
    }

    const alarmRankRate = ref([
      { title: '响应率', count: 0, field: 'response', ratio: 10, unit: '%' },
      { title: '处理率', count: 0, field: 'handled', ratio: -10, unit: '%' },
      { title: '超时率', count: 0, field: 'timeout', ratio: -10, unit: '%' }
    ])
    /** 报警处理 响应率 超时率 处理率 */
    const alarmStatus = ref([
      {
        title: '消防报警数', count: 0, ratio: 10
      }
    ])
    const alarmEvent = (item: { status: string; }): void => {
      const params = {
        alarmStatus: item.status,
        startTime: period.value.split(',')[0],
        endTime: period.value.split(',')[1],
        marketTenant: marketStore.currentMarket,
        alarmTypeCode: 'FIRECONTROL'
      }
      cubeAppService.toSafetyAlarmRecordPage(JSON.stringify(params))
    }
    const alarmHandleRate = async (): Promise<void> => {
      try {
        const params = {
          applicationCodes: [ApplicationCode.FIRE],
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
    const fireSituation = ref([
      {
        title: '消防设备数',
        imgSrc: 'device-num',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '在线设备数',
        imgSrc: 'device-online',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '离线设备数',
        imgSrc: 'device-offline',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '消防设备建档数',
        imgSrc: 'device-put-on-record',
        value: 0,
        unit: '',
        qoq: 0
      },
      {
        title: '消防设备到期数',
        imgSrc: 'device-expire',
        value: 0,
        unit: '',
        qoq: 0
      },
    ])
    const alarmTrendData = reactive<{
      CategoryData: string[];
      series: number[];
    }>({
      CategoryData: [],
      series: []
    })
    // 消防设备在线/离线
    const getDeviceCountStatus = async (): Promise<void> => {
      const deviceStatus = await cubeSafetySupervisionService.deviceCountStatus({
        payload: JSON.stringify({ applicationCodes: ['FIRECONTROL'], marketTenantIDs: marketStore.currentMarket ? [marketStore.currentMarket] : [] }),
        metric: 'safety_management-device-status_distribution',
      })
      fireSituation.value[0] = deviceStatus[0]
      fireSituation.value[1] = deviceStatus[1]
      fireSituation.value[2] = deviceStatus[2]
    }
    // 消防设备到期/建档
    const getRiskCountStatus = async (): Promise<void> => {
      const riskStatus = await cubeSafetySupervisionService.riskCountStatus({
        types: 'FIRE_FIGHTING_EQUIPMENT',
        marketTenantIDs: marketStore.currentMarket
      })
      fireSituation.value[3] = riskStatus[0]
      fireSituation.value[4] = riskStatus[1]
    }
    // 设备跳转
    const clickWorkSituation = (item: { title: string; }): void => {
      if (['消防设备数', '在线设备数', '离线设备数'].includes(item.title)) {
        const params = {
          marketTenant: marketStore.currentMarket,
          type: '',
          status: item.title === '在线设备数' ? '1' : item.title === '离线设备数' ? '0' : '',
        }
        cubeAppService.toSafetyDevicePage(JSON.stringify(params))
      }
    }
    const getAlarmStatisticsGroup = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmStatisticsGroup({
        applicationCode: ApplicationCode.FIRE,
        period: period.value,
        marketTenants: marketStore.currentMarket ? [marketStore.currentMarket] : []
      })
      alarmStatus.value = res.map(item => {
        return {
          title: item.statusName === '报警数' ? '消防' + item.statusName : item.statusName,
          count: item.totalNum,
          ratio: item.ratio,
          field: item
        }
      })
    }
    // 报警事件占比
    const getAlarmEventTypeRatio = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmEventTypeRatio({
        applicationCode: ApplicationCode.FIRE,
        period: period.value,
        marketTenants: marketStore.currentMarket ? [marketStore.currentMarket] : []
      })
      eventProportionData.value = res.map((item, index) => {
        return {
          label: item.name,
          color: colorList[index],
          value: item.totalNum,
          ratio: item.ratio
        }
      })
    }
    // 报警跳转
    const alarmTypeDrilling = (id: string): void => {
      const params = {
        alarmEventTypeCode: id,
        startTime: period.value.split(',')[0],
        endTime: period.value.split(',')[1],
        marketTenant: marketStore.currentMarket,
        alarmTypeCode: 'FIRECONTROL'
      }
      cubeAppService.toSafetyAlarmRecordPage(JSON.stringify(params))
    }
    /** 报警处理 市场排名 维度 */
    const alarmHandleType = ref<'response' | 'timeout' | 'handled'>('response')
    /** 报警处理 市场排名 */
    const alarmHandleRank = async (type?: 'response' | 'timeout' | 'handled'): Promise<void> => {
      type && (alarmHandleType.value = type)
      const res = await cubeSafetySupervisionAlarmHandleService.getMarketRankByMetric({
        metric: alarmHandleType.value,
        applicationCodes: [ApplicationCode.FIRE],
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
    // 报警趋势
    const getAlarmTrendAnalysis = async (): Promise<void> => {
      const res = await cubeSafetyManagementAlarmService.alarmTrendAnalysis({ applicationCode: ApplicationCode.FIRE, period: period.value, type: timeType.value, marketTenants: [marketStore.currentMarket] })
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
    watch(() => marketStore.currentMarket, () => {
      onRefresh()
    })
    onMounted(() => {
      document.title = '消防安全'
      onRefresh()
    })
    return (): JSX.Element => (
      <>
        <div class='page'>
          <div style={{ marginBottom: '10px' }}><DatePickerSelector value={period.value.split(',')} selectType={timeType.value} onChange={handleChangeDate} /></div>
          <PullRefresh v-model={refreshLoading.value} onRefresh={onRefresh}>
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
            <div class='card colorLinear'>
              <div class='title'>{marketStore.currentMarket === '' ? '报警处理排名' : '报警处理'}</div>
              <AlarmCountStatistics dataSource={alarmRankRate.value} onChange={alarmHandleRank} currentActive={alarmHandleType.value} />
              {marketStore.currentMarket === ''
                ? <Rank rankData={alarmRanking.value} maxValue={100} unit='%' />
                : null}

            </div>
            <div class='card'>
              <div class='title'>报警趋势</div>
              <LineChart CategoryData={alarmTrendData.CategoryData} series={alarmTrendData.series} />
            </div>
            <div><WorkSituation title='消防建档情况' dataSource={fireSituation.value} isQOQ={false} onClickItem={clickWorkSituation} /></div>
          </PullRefresh>
        </div>

      </>
    )
  }
})
