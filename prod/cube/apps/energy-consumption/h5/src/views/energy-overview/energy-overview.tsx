import { defineComponent, onMounted, reactive, ref } from 'vue'
import styles from './index.module.less'
import { getAssetsFile, goAlarmRecords } from '@/utils'
import { Card } from '@/components/card/card'
import { AlarmCountStatistics } from '@/components/alarm-count-statistics'
import { LineChart } from '@/components/charts/line-chart/line-chart'
import Epie from '@/components/charts/pie/epie'
import PlanList from '@/components/charts/pie-list/pie-list'
import Sankey from '@/components/charts/sankey/sankey'
import { cubeEnergyManagementService } from '@/api/server'
import { storeEnergy } from '@/store/energy'
import { useRouter } from 'vue-router'
import { Empty } from 'vant'
import { BarChart } from '@/components/charts/bar-chart/bar-chart'
import type { Data, Link } from '@ghcloud/cube-energy-consumption-service/src/energy-management.service'
export const EnergyOverview = defineComponent({
  setup: () => {
    const router = useRouter()
    const comprehensiveEnergy = ref([
      { title: '综合能耗 tce', type: 'zh', count: 3455, ratio: 10 },
      { title: '碳排量 kgCO₂e', type: 'carbon', count: 3455, ratio: 10 }
    ])
    const otherEnergy = ref([
      { title: '', count: 0, ratio: 0 }
    ])
    const piniaStoreEnergy = storeEnergy()
    const energydirectionNode = ref<Data[]>([])
    const alarmTotal = ref(0)
    const energydirectionLinks = ref<Link[]>([])
    const alarmData = ref([
      {
        label: '待确认报警数',
        value: 10,
        color: '#2878F7'
      }
    ])
    const carbonTrends = reactive({
      xData: [''],
      yData: [0]
    })
    const energyTrend = reactive({
      xData: [''],
      yData: [0]
    })
    const areaEnergyTop = reactive({
      xAxis: [''],
      series: [0]
    })
    const getCollectConfigList = async (): Promise<void> => {
      const res = await cubeEnergyManagementService.collectConfigList()
      piniaStoreEnergy.energyType = res.map(e => {
        return {
          text: e.categoryName,
          value: e.categoryCode
        }
      })
    }
    const getDataStatistics = async (value: { period: string;type: string; }): Promise<void> => {
      let res = await cubeEnergyManagementService.usageStatCategoryAll({ period: value.period, type: value.type })
      comprehensiveEnergy.value.forEach(item => {
        res.forEach(e => {
          if (item.type === e.instrumentType) {
            item.count = e.value
            item.ratio = e.qoqValueRate || 0
          }
        })
      })
      res = res.filter(item => item.instrumentType !== 'zh' && item.instrumentType !== 'carbon')
      otherEnergy.value = res.map(e => {
        return {
          title: e.instrumentTypeName,
          count: e.value,
          ratio: e.qoqValueRate || 0
        }
      })
    }
    const getCarbonEmissionTrends = async (value: { period: string;type: string; }): Promise<void> => {
      const res = await cubeEnergyManagementService.dailySummaryTrend({ period: value.period, type: value.type })
      carbonTrends.xData = res.map(e => e.time)
      carbonTrends.yData = res.map(e => e.dcValue)
    }
    const getProjectAreaStatFlow = async (value: { period: string;type: string; }): Promise<void> => {
      const res = await cubeEnergyManagementService.projectAreaStatFlow({ period: value.period, projectCategory: 'AREA', type: value.type })
      energydirectionNode.value = res?.data ?? []
      energydirectionLinks.value = res?.links ?? []
    }
    const getUsageDcStatTrend = async (value: { period: string;instrumentType: string;type: string; }): Promise<void> => {
      const res = await cubeEnergyManagementService.usageDcStatTrend({ period: value.period, instrumentType: value.instrumentType, type: value.type })
      energyTrend.xData = res.map(e => e.time)
      energyTrend.yData = res.map(e => e.value)
    }
    const getProjectStatCategory = async (value: { period: string;instrumentType: string;type: string; }): Promise<void> => {
      const res = await cubeEnergyManagementService.projectStatCategory({ period: value.period, instrumentType: value.instrumentType, projectCategory: 'AREA', type: value.type })
      res.sort((a, b) => { return a.value - b.value })
      areaEnergyTop.xAxis = res.map(e => e.name)
      areaEnergyTop.series = res.map(e => e.value)
    }
    const getAlarmData = async (value: { period: string;instrumentType: string;type: string; }): Promise<void> => {
      const params = {
        applicationCode: 'ENERGY_CONSUMPTION', // SECURITY_MONITORING
        period: value.period,
      }
      const res = await cubeEnergyManagementService.alarmSummaryStatGroup(params)
      const colorList = ['#328BF7', '#EF424A', '#FFC700', '#19F8F7', '#A0BFFF']
      alarmData.value = res.map((e, i) => {
        return {
          label: e.alarmStatusName,
          value: e.alarmNum,
          color: colorList[i]
        }
      })
    }
    const handleClickItem = (): void => {
      goAlarmRecords({ sourceApp: 'ENERGY_CONSUMPTION' })
    }
    const getAlarmTotal = async (): Promise<void> => {
      const params = {
        applicationCode: 'ENERGY_CONSUMPTION',
        pageNumber: 1,
        pageSize: 10,
      }
      const res = await cubeEnergyManagementService.getAlarmRecordsPage(params)
      alarmTotal.value = res.total
    }
    onMounted(() => {
      document.title = '能耗总览'
      getAlarmTotal()
      getCollectConfigList()
    })
    return () => (
      <>
        <div class={[styles.page]}>
          <Card title='业务操作' showDate={false} showType={false}>
            <div class={styles.content}>
              <div class={styles['content-item']} style={{ 'margin-right': '10px', background: '#F8FCFF' }} onClick={() => { router.push({ path: '/energy-analysis' }) }}>
                <img src={getAssetsFile('energy-analysis.png')} alt='' />
                <div>能耗分析</div>
              </div>
              <div class={styles['content-item']} style={{ background: '#FCF9FF' }} onClick={() => { router.push({ path: '/metering-device-list' }) }}>
                <img src={getAssetsFile('energy-device.png')} alt='' />
                <div>计量设备</div>
              </div>
              <div class={styles['content-item']} style={{ background: '#FFF9F9' }} onClick={handleClickItem}>
                <img src={getAssetsFile('energy-alarm.png')} alt='' />
                <div>设备报警</div>
              </div>
            </div>
          </Card>
          <div class={styles.alarmBox}>
            <div class={styles['alarmBox-left']}>
              <img src={getAssetsFile('energy-alarm.png')} alt='' />
              <div>能耗报警</div>
            </div>
            <div class={styles['alarmBox-right']}>
              <span>{alarmTotal.value}</span> 个
            </div>
          </div>
          <Card title='数据统计' showType={false} onChange={getDataStatistics}>
            <div class={styles.content}>
              <AlarmCountStatistics disabled dataSource={comprehensiveEnergy.value} />
            </div>
            <div class={styles['energy-box']}>
              {
                otherEnergy.value.map(item => {
                  return (
                    <div class={styles['energy-item']}>
                      <div>{item.title}</div>
                      <div class={styles['energy-value']}>
                        <div class={styles.ratio}>
                          环比 <span class={[styles.ratio_num, item.ratio > 0 && styles.ratio_up]}>{item.ratio > 0 ? `+${item.ratio}` : item.ratio}%</span>
                          {item.ratio > 0 && <img src='../../assets/images/ratio-up.png' alt='' />}
                          {
                          item.ratio < 0 && <img src='../../assets/images/ratio-down.png' class={styles.img_down} alt='' />
                          }
                        </div>
                        <div>{item.count}</div>
                      </div>
                    </div>
                  )
                })
              }
            </div>
          </Card>
          <Card title='碳排放趋势' showType={false} onChange={getCarbonEmissionTrends}>
            <LineChart v-show={carbonTrends.xData.length} CategoryData={carbonTrends.xData} series={carbonTrends.yData} />
            <Empty v-show={!carbonTrends.xData.length} description='暂无数据' />
          </Card>
          <Card title='能耗报警' showType={false} onChange={getAlarmData}>
            <div class={styles.flex}>
              <Epie pieData={alarmData.value} />
              <PlanList roundPieData={alarmData.value} />
            </div>
          </Card>
          <Card title='能源走向' showType={false} onChange={getProjectAreaStatFlow}>
            <div style={{ height: '300px' }} v-show={energydirectionNode.value.length}>
              <Sankey nodes={energydirectionNode.value} links={energydirectionLinks.value} />
            </div>
            <Empty v-show={!energydirectionNode.value.length} description='暂无数据' />
          </Card>
          <Card title='用能趋势' onChange={getUsageDcStatTrend}>
            <LineChart v-show={energyTrend.xData.length} CategoryData={energyTrend.xData} series={energyTrend.yData} />
            <Empty v-show={!energyTrend.xData.length} description='暂无数据' />
          </Card>
          <Card title='区域用能TOP10' onChange={getProjectStatCategory}>
            <BarChart v-show={areaEnergyTop.xAxis.length} xAxis={areaEnergyTop.xAxis} series={areaEnergyTop.series} />
            <Empty v-show={!areaEnergyTop.xAxis.length} description='暂无数据' />
          </Card>
        </div>
      </>
    )
  }
})
