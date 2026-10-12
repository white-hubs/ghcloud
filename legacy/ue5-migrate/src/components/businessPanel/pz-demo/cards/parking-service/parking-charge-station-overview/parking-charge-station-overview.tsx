import { defineComponent, onMounted, ref } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import { use } from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
} from 'echarts/components'
import styles from './parking-charge-station-overview.module.less'
import { PZService } from '../../../card-service/service'

use([
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent
])

export const ParkingChargeStationOverview = defineComponent({
  setup () {
    // 充电桩使用概览数据
    const overviewData = ref({
      usageRate: {
        current: 75.5,
        yearOnYear: 5.2,
        monthOnMonth: 3.1
      },
      faultCount: {
        current: 12,
        yearOnYear: -2.5,
        monthOnMonth: 1.8
      },
      avgUsageTime: {
        current: 120,
        yearOnYear: 8.5,
        monthOnMonth: 4.2
      }
    })
    const getData = async (): Promise<void> =>{
      try {
        const result = await PZService.parking.getChargingStationOverview()
        overviewData.value = {
          usageRate: {
            current: result.usageRate,
            yearOnYear: result.usageOnYear,
            monthOnMonth: result.usageChain
          },
          faultCount: {
            current: result.faultRate,
            yearOnYear: result.faultRateOnYear,
            monthOnMonth: result.faultChain
          },
          avgUsageTime: {
            current: result.avgUseTime,
            yearOnYear: result.avgUseTimeOnYear,
            monthOnMonth: result.avgUseTimeChain
          }
        }
      } catch {
      }
    }
    onMounted(() => {
      getData()
    })

    // 格式化数字，保留1位小数，整数时不显示小数位
    const formatNumber = (num: number): string => {
      return Number.isInteger(num) ? num.toString() : num.toFixed(1)
    }

    return (): JSX.Element => (
      <SubPanelTemplate title="充电桩使用概览">
        <div class={styles.overviewGrid}>
          <div class={styles.overviewItem}>
            <div class={styles.itemTitle}>本月充电桩使用率</div>
            <div class={styles.itemValue}>{formatNumber(overviewData.value.usageRate.current)}%</div>
            <div class={styles.itemCompare}>
              <span class={overviewData.value.usageRate.yearOnYear > 0 ? styles.positive : styles.negative}>
                同比 {overviewData.value.usageRate.yearOnYear > 0 ? '+' : ''}{formatNumber(overviewData.value.usageRate.yearOnYear)}%
              </span>
              <span class={overviewData.value.usageRate.monthOnMonth > 0 ? styles.positive : styles.negative}>
                环比 {overviewData.value.usageRate.monthOnMonth > 0 ? '+' : ''}{formatNumber(overviewData.value.usageRate.monthOnMonth)}%
              </span>
            </div>
          </div>
          <div class={styles.overviewItem}>
            <div class={styles.itemTitle}>故障次数</div>
            <div class={styles.itemValue}>{formatNumber(overviewData.value.faultCount.current)}</div>
            <div class={styles.itemCompare}>
              <span class={overviewData.value.faultCount.yearOnYear > 0 ? styles.positive : styles.negative}>
                同比 {overviewData.value.faultCount.yearOnYear > 0 ? '+' : ''}{formatNumber(overviewData.value.faultCount.yearOnYear)}%
              </span>
              <span class={overviewData.value.faultCount.monthOnMonth > 0 ? styles.positive : styles.negative}>
                环比 {overviewData.value.faultCount.monthOnMonth > 0 ? '+' : ''}{formatNumber(overviewData.value.faultCount.monthOnMonth)}%
              </span>
            </div>
          </div>
          <div class={styles.overviewItem}>
            <div class={styles.itemTitle}>平均使用时长(分钟)</div>
            <div class={styles.itemValue}>{formatNumber(overviewData.value.avgUsageTime.current)}</div>
            <div class={styles.itemCompare}>
              <span class={overviewData.value.avgUsageTime.yearOnYear > 0 ? styles.positive : styles.negative}>
                同比 {overviewData.value.avgUsageTime.yearOnYear > 0 ? '+' : ''}{formatNumber(overviewData.value.avgUsageTime.yearOnYear)}%
              </span>
              <span class={overviewData.value.avgUsageTime.monthOnMonth > 0 ? styles.positive : styles.negative}>
                环比 {overviewData.value.avgUsageTime.monthOnMonth > 0 ? '+' : ''}{formatNumber(overviewData.value.avgUsageTime.monthOnMonth)}%
              </span>
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})