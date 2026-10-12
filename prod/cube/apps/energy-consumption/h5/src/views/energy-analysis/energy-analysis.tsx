import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from '../energy-overview/index.module.less'
import { Card } from '@/components/card/card'
import { Tab, Tabs, Loading, Overlay, PullRefresh, Empty } from 'vant'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import { StackedBar } from '@/components/charts/stacked-bar/stacked-bar'
import Pie from '@/components/charts/pie/pie'
import { BarChart } from '@/components/charts/bar-chart/bar-chart'
import { cubeEnergyManagementService } from '@/api/server'
import { groupByField } from '@/utils'
import { storeEnergy } from '@/store/energy'

export const EnergyAnalysis = defineComponent({

  setup: () => {
    const tabActive = ref(0)
    const refreshing = ref(false)
    const piniaStoreEnergy = storeEnergy()
    const comprehensiveEnergy = ref([
      { title: '今日碳排量 tCO₂e', count: 0, ratio: 0 },
      { title: '本月碳排量 tCO₂e', count: 0, ratio: 0 },
      { title: '本年碳排量 tCO₂e', count: 0, ratio: 0 }
    ])
    const consumptionEnergy = ref([
      { title: '今日综合能耗 tce', count: 0, ratio: 0 },
      { title: '本月综合能耗 tce', count: 0, ratio: 0 },
      { title: '本年综合能耗 tce', count: 0, ratio: 0 }
    ])
    const consumptionUsage = ref([
      { title: '今日总用能 kWh', count: 0, ratio: 0 },
      { title: '本月总用能 kWh', count: 0, ratio: 0 },
      { title: '本年总用能 kWh', count: 0, ratio: 0 }
    ])
    const subItemRankingChart = {
      xAxis: [''],
      series: [0]
    }
    const loadingShow = ref(false)
    const carbonSubItemsData = ref([
      {
        label: '',
        value: 0,
      },
    ])
    const energySubItemsData = ref([
      {
        label: '',
        value: 0,
      },
    ])
    const usageSubItemsData = ref([
      {
        label: '',
        value: 0,
      },
    ])
    const carbonAreaData = ref([
      {
        label: '',
        value: 0,
      },
    ])
    const energyAreaData = ref([
      {
        label: '',
        value: 0,
      },
    ])
    const carbonTrends = reactive({
      xData: [''],
      yData: [0]
    })
    const energyTrends = reactive({
      xData: [''],
      yData: [0]
    })
    const consumptionTrends = reactive({
      xData: [''],
      yData: [0]
    })
    const statisticsEmissions = reactive({
      xData: [''],
      yData: [{ name: '', value: [0] }]
    })
    const energyEmissions = reactive({
      xData: [''],
      yData: [{ name: '', value: [0] }]
    })
    const usageEmissions = reactive({
      xData: [''],
      yData: [{ name: '', value: [0] }]
    })
    const energyUsageParams = {
      instrumentType: '',
      trendTimeData: { // 用能趋势图
        type: '',
        period: ''
      },
      distributionTimeData: { // 用能分布
        type: '',
        period: ''
      },
      usageProportionateData: { // 用能占比统计
        type: '',
        period: ''
      },
      subItemRankingData: { // 分项排名
        type: '',
        period: ''
      },
    }
    const getUsageStatCarbonDmy = async (): Promise<void> => {
      const res = await cubeEnergyManagementService.usageStatCarbonDmy({ exportType: 'CARBON' })
      comprehensiveEnergy.value[0].ratio = res.qoqDayValueRate ?? '0'
      comprehensiveEnergy.value[0].count = res.dayValue
      comprehensiveEnergy.value[1].ratio = res.qoqMonthValueRate ?? '0'
      comprehensiveEnergy.value[1].count = res.monthValue
      comprehensiveEnergy.value[2].ratio = res.qoqYearValueRate ?? '0'
      comprehensiveEnergy.value[2].count = res.yearValue

      const data = await cubeEnergyManagementService.usageStatCarbonDmy({ exportType: 'ALL' })
      consumptionEnergy.value[0].ratio = data.qoqDayValueRate ?? '0'
      consumptionEnergy.value[0].count = data.dayValue
      consumptionEnergy.value[1].ratio = data.qoqMonthValueRate ?? '0'
      consumptionEnergy.value[1].count = data.monthValue
      consumptionEnergy.value[2].ratio = data.qoqYearValueRate ?? '0'
      consumptionEnergy.value[2].count = data.yearValue
    }
    const getCarbonEmissionTrends = async (value: { period: string;type: string; }): Promise<void> => {
      const res = await cubeEnergyManagementService.usageDcAtaTrend({ period: value.period, type: value.type })
      carbonTrends.xData = res.map(e => e.time)
      carbonTrends.yData = res.map(e => e.dcValue)
    }
    const getDcStatTimeCategory = async (value: { period: string;type: string; }): Promise<void> => {
      const res = await cubeEnergyManagementService.dcStatTimeCategory({ period: value.period, type: value.type })
      const time = [...new Set(res.map(e => e.time))]
      const data = groupByField(res, 'name')
      const arr: { dcValue: number; time: string;name: string; }[][] = []
      for (const key in data) {
        arr.push(data[key])
      }
      arr.forEach(e => {
        time.forEach(date => {
          if (!e.some(item => item.time === date)) {
            e.push({
              name: e[0].name,
              time: date,
              dcValue: 0
            })
          }
        })
      })
      arr.forEach(e => {
        e = e.sort((a, b) => {
          return Number(new Date(a.time)) - Number(new Date(b.time))
        })
      })
      statisticsEmissions.xData = time
      statisticsEmissions.yData = arr.map(item => {
        return {
          name: item[0].name,
          value: item.map(e => e.dcValue)
        }
      })
    }
    const getDcEnergyCategory = async (value: { period: string;type: string; }): Promise<void> => {
      const res = await cubeEnergyManagementService.dcStatTimeCategory({ period: value.period, type: value.type })
      const time = [...new Set(res.map(e => e.time))]
      const data = groupByField(res, 'name')
      const arr: { zhValue: number; time: string;name: string; }[][] = []
      for (const key in data) {
        arr.push(data[key])
      }
      arr.forEach(e => {
        time.forEach(date => {
          if (!e.some(item => item.time === date)) {
            e.push({
              name: e[0].name,
              time: date,
              zhValue: 0
            })
          }
        })
      })
      arr.forEach(e => {
        e = e.sort((a, b) => {
          return Number(new Date(a.time)) - Number(new Date(b.time))
        })
      })
      energyEmissions.xData = time
      energyEmissions.yData = arr.map(item => {
        return {
          name: item[0].name,
          value: item.map(e => e.zhValue)
        }
      })
    }
    const carbonSubItems = async (value: { period: string;type: string;instrumentType: string;projectIds: string; }): Promise<void> => {
      const params = {
        period: value.period,
        type: value.type,
        projectCategory: 'ITEM',
        instrumentType: value.instrumentType,
        projectIds: value.projectIds
      }
      const res = await cubeEnergyManagementService.projectStatCategory(params)
      carbonSubItemsData.value = res.map(e => {
        return {
          label: e.name,
          value: e.dcValue,
        }
      })
    }
    const energySubItems = async (value: { period: string;type: string;instrumentType: string;projectIds: string; }): Promise<void> => {
      const params = {
        period: value.period,
        type: value.type,
        projectCategory: 'ITEM',
        instrumentType: value.instrumentType,
        projectIds: value.projectIds
      }
      const res = await cubeEnergyManagementService.projectStatCategory(params)
      energySubItemsData.value = res.map(e => {
        return {
          label: e.name,
          value: e.zhValue,
        }
      })
    }
    const usageSubItems = async (value?: { period: string;type: string; }): Promise<void> => {
      if (value) {
        energyUsageParams.usageProportionateData = {
          type: value.type,
          period: value.period
        }
      }
      const params = {
        ...energyUsageParams.usageProportionateData,
        instrumentType: energyUsageParams.instrumentType,
        projectCategory: 'AREA'
      }
      const res = await cubeEnergyManagementService.UsageSubItemTrend(params)
      const time = [...new Set(res.map(e => e.time))]
      const data = groupByField(res, 'name')
      const arr: { value: number; time: string;name: string; }[][] = []
      for (const key in data) {
        arr.push(data[key])
      }
      arr.forEach(e => {
        time.forEach(date => {
          if (!e.some(item => item.time === date)) {
            e.push({
              name: e[0].name,
              time: date,
              value: 0
            })
          }
        })
      })
      arr.forEach(e => {
        e = e.sort((a, b) => {
          return Number(new Date(a.time)) - Number(new Date(b.time))
        })
      })
      usageEmissions.xData = time
      usageEmissions.yData = arr.map(item => {
        return {
          name: item[0].name,
          value: item.map(e => e.value)
        }
      })
    }
    const carbonArea = async (value: { period: string;type: string;instrumentType: string;projectIds: string;projectAreaIds: string; }): Promise<void> => {
      const params = {
        period: value.period,
        type: value.type,
        projectCategory: 'AREA',
        instrumentType: value.instrumentType,
        projectIds: value.projectAreaIds
      }
      const res = await cubeEnergyManagementService.projectStatCategory(params)
      carbonAreaData.value = res.map(e => {
        return {
          label: e.name,
          value: e.dcValue,
        }
      })
    }
    const energyArea = async (value: { period: string;type: string;instrumentType: string;projectIds: string;projectAreaIds: string; }): Promise<void> => {
      const params = {
        period: value.period,
        type: value.type,
        projectCategory: 'AREA',
        instrumentType: value.instrumentType,
        projectIds: value.projectAreaIds
      }
      const res = await cubeEnergyManagementService.projectStatCategory(params)
      energyAreaData.value = res.map(e => {
        return {
          label: e.name,
          value: e.zhValue,
        }
      })
    }
    const getCarbonEnergyTrends = async (value: { period: string;type: string;instrumentType: string;projectIds: string; }): Promise<void> => {
      const params = {
        period: value.period,
        type: value.type,
      }
      const res = await cubeEnergyManagementService.dailySummaryTrend(params)
      energyTrends.xData = res.map(e => {
        return e.time
      })
      energyTrends.yData = res.map(e => {
        return e.zhValue
      })
    }
    const energyConsumptionAll = async (value: { period: string;type: string;instrumentType: string;projectIds: string; }): Promise<void> => {
      energyUsageParams.instrumentType = value.instrumentType
      energyConsumptionSituation()
      energyConsumptionTrend()
      usageSubItems()
      getSubItemProperty()
      subItemRanking()
    }
    const energyConsumptionSituation = async (): Promise<void> => {
      const res = await cubeEnergyManagementService.EnergySituation({ instrumentType: energyUsageParams.instrumentType })
      consumptionUsage.value[0].ratio = res.qoqDayValueRate ?? '0'
      consumptionUsage.value[0].count = res.dayValue
      consumptionUsage.value[1].ratio = res.qoqMonthValueRate ?? '0'
      consumptionUsage.value[1].count = res.monthValue
      consumptionUsage.value[2].ratio = res.qoqYearValueRate ?? '0'
      consumptionUsage.value[2].count = res.yearValue
    }
    // 用能趋势图
    const energyConsumptionTrend = async (value?: { period: string;type: string;instrumentType: string;projectIds: string; }): Promise<void> => {
      if (value) {
        energyUsageParams.distributionTimeData = {
          type: value.type,
          period: value.period
        }
      }
      const res = await cubeEnergyManagementService.usageTrend({ ...energyUsageParams.distributionTimeData, instrumentType: energyUsageParams.instrumentType, projectCategory: 'AREA' })
      consumptionTrends.xData = res.map(e => e.time)
      consumptionTrends.yData = res.map(e => e.value)
    }
    // 用能占比统计
    const getSubItemProperty = async (value?: { period: string;type: string;instrumentType: string;projectIds: string; }): Promise<void> => {
      if (value) {
        energyUsageParams.trendTimeData = {
          type: value.type,
          period: value.period
        }
      }
      const params = {
        ...energyUsageParams.trendTimeData,
        instrumentType: energyUsageParams.instrumentType,
        projectCategory: 'AREA'
      }
      const res = await cubeEnergyManagementService.projectStatCategory(params)
      usageSubItemsData.value = res.map(e => {
        return {
          label: e.name,
          value: e.value
        }
      })
    }
    // 分项排名
    const subItemRanking = async (value?: { period: string;type: string;instrumentType: string;projectIds: string; }): Promise<void> => {
      if (value) {
        energyUsageParams.subItemRankingData = {
          type: value.type,
          period: value.period
        }
      }
      const params = {
        ...energyUsageParams.subItemRankingData,
        instrumentType: energyUsageParams.instrumentType,
        projectCategory: 'AREA'
      }
      const res = await cubeEnergyManagementService.projectStatCategory(params)
      const arr = res.sort((a, b) => {
        return a.value - b.value
      })
      subItemRankingChart.xAxis = arr.map((e) => {
        return e.name
      })
      subItemRankingChart.series = arr.map((e) => {
        return e.value
      })
    }
    const getCollectConfigList = async (): Promise<void> => {
      const res = await cubeEnergyManagementService.collectConfigList()
      piniaStoreEnergy.energyType = res.map(e => {
        return {
          text: e.categoryName,
          value: e.categoryCode
        }
      })
    }
    const onRefresh = (): void => {
      refreshing.value = false
    }
    onMounted(() => {
      document.title = '能耗分析'
      getCollectConfigList()
      getUsageStatCarbonDmy()
    })
    return () => (
      <>
        <Overlay show={loadingShow.value} z-index='1000'>
          <div class={styles.loading}>
            <Loading vertical size='24px' color='#1989fa'>加载中...</Loading>
          </div>
        </Overlay>
        <div class={[styles.page]}>
          <PullRefresh v-model={refreshing.value} onRefresh={onRefresh}>
            <Tabs v-model:active={tabActive.value} sticky swipeable lazy-render>
              <Tab key='碳排统计' title='碳排统计'>
                <div style='margin-top:10px' />
                <Card title='碳排统计' showDate={false} showType={false}>
                  <div class={styles.content}>
                    <AlarmCountStatistics disabled dataSource={comprehensiveEnergy.value} />
                  </div>
                </Card>
                <Card title='碳排放趋势' showType={false} onChange={getCarbonEmissionTrends}>
                  <LineChart v-show={carbonTrends.xData.length} title='单位：tCO2e' CategoryData={carbonTrends.xData} series={carbonTrends.yData} />
                  <Empty v-show={!carbonTrends.xData.length} description='暂无数据' />
                </Card>
                <Card title='碳排放分类统计' showType={false} onChange={getDcStatTimeCategory}>
                  <StackedBar v-show={statisticsEmissions.xData.length} xData={statisticsEmissions.xData} yData={statisticsEmissions.yData} />
                  <Empty v-show={!statisticsEmissions.xData.length} description='暂无数据' />
                </Card>
                <Card title='碳排分项占比' showArea showType onChange={carbonSubItems}>
                  <Pie v-show={carbonSubItemsData.value.length} pieData={carbonSubItemsData.value} pieClass='width100' showLegend />
                  <Empty v-show={!carbonSubItemsData.value.length} description='暂无数据' />
                </Card>
                <Card title='碳排区域占比' showAreaPop showType onChange={carbonArea}>
                  <Pie v-show={carbonAreaData.value.length} pieData={carbonAreaData.value} pieClass='width100' showLegend />
                  <Empty v-show={!carbonAreaData.value.length} description='暂无数据' />
                </Card>
              </Tab>
              <Tab key='综合能耗' title='综合能耗'>
                <div style='margin-top:10px' />
                <Card title='综合能耗' showDate={false} showType={false}>
                  <div class={styles.content}>
                    <AlarmCountStatistics disabled dataSource={consumptionEnergy.value} />
                  </div>
                </Card>
                <Card title='综合能耗趋势' showType={false} onChange={getCarbonEnergyTrends}>
                  <LineChart v-show={energyTrends.xData.length} title='单位：tce' CategoryData={energyTrends.xData} series={energyTrends.yData} />
                  <Empty v-show={!energyTrends.xData.length} description='暂无数据' />
                </Card>
                <Card title='综合能耗分类统计' showType={false} onChange={getDcEnergyCategory}>
                  <StackedBar v-show={energyEmissions.xData.length} xData={energyEmissions.xData} yData={energyEmissions.yData} />
                  <Empty v-show={!energyEmissions.xData.length} description='暂无数据' />
                </Card>
                <Card title='分项占比' showArea showType onChange={energySubItems}>
                  <Pie v-show={energySubItemsData.value.length} pieData={energySubItemsData.value} pieClass='width100' showLegend />
                  <Empty v-show={!energySubItemsData.value.length} description='暂无数据' />
                </Card>
                <Card title='区域占比' showAreaPop showType onChange={energyArea}>
                  <Pie v-show={energyAreaData.value.length} pieData={energyAreaData.value} pieClass='width100' showLegend />
                  <Empty v-show={!energyAreaData.value.length} description='暂无数据' />
                </Card>
              </Tab>
              <Tab key='用能分析' title='用能分析'>
                <div style='margin-top:10px' />
                <Card title='用能情况' showDate={false} showType onChange={energyConsumptionAll}>
                  <div class={styles.content}>
                    <AlarmCountStatistics disabled dataSource={consumptionUsage.value} />
                  </div>
                </Card>
                <Card title='用能趋势图' showType={false} onChange={energyConsumptionTrend}>
                  <LineChart v-show={consumptionTrends.xData.length} title='单位：kWh' CategoryData={consumptionTrends.xData} series={consumptionTrends.yData} />
                  <Empty v-show={!consumptionTrends.xData.length} description='暂无数据' />
                </Card>
                <Card title='用能分布' showType={false} onChange={usageSubItems}>
                  <StackedBar v-show={usageEmissions.xData.length} xData={usageEmissions.xData} yData={usageEmissions.yData} />
                  <Empty v-show={!usageEmissions.xData.length} description='暂无数据' />
                </Card>
                <Card title='用能占比统计' showType={false} onChange={getSubItemProperty}>
                  <Pie v-show={usageSubItemsData.value.length} pieData={usageSubItemsData.value} pieClass='width100' showLegend />
                  <Empty v-show={!usageSubItemsData.value.length} description='暂无数据' />
                </Card>
                <Card title='区域排名' showType={false} onChange={subItemRanking}>
                  <BarChart v-show={subItemRankingChart.xAxis.length} xAxis={subItemRankingChart.xAxis} series={subItemRankingChart.series} />
                  <Empty v-show={!subItemRankingChart.xAxis.length} description='暂无数据' />
                </Card>
              </Tab>
            </Tabs>
          </PullRefresh>
        </div>
      </>
    )
  }
})
