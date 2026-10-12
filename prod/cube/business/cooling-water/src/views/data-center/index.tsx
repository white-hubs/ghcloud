import { defineComponent } from 'vue'
import { GLayout } from '@/components/common/layout'
import { RadioGroup, DateRangePicker, Button } from '@ghcloud/cube-ui'
import styles from './index.module.less'
import { ChartCard } from './component/chart-card'
import { DeviceStatisticsBar } from './component/device-statiistics-bar'
import { AlarmStatisticsBar } from './component/alarm-statistics-bar'
import { PieChart } from '@/components/chart/pie-charts'
import { RankingStripType } from './component/ranking-strip-type'
import { LineCharts } from '@/components/chart/line-charts'
export const DataCenter = defineComponent({
  setup: () => {
    const timeOptions = [
      { label: '今日', value: 'today' },
      { label: '本月', value: 'month' },
      { label: '今年', value: 'year' }
    ]
    const layoutSlots = {
      'header-btn': (): JSX.Element => {
        return (
          <div class={styles['header-search-bar']}>
            <RadioGroup options={timeOptions} buttonStyle='solid' />
            <div class={styles['time-picker-item']}>
              <label>时间选择</label>
              <DateRangePicker style={{ width: '300px' }} />
            </div>
            <Button type='primary'>搜索</Button>
          </div>
        )
      },
      'content-table': (): JSX.Element => {
        return (
          <>
            <div class={styles['device-status-statistic']}>
              <div class={styles.title}>设备状态统计</div>
              <DeviceStatisticsBar />
              <div class={styles['statistic-charts-container']}>
                <ChartCard title='设备报警占比'>
                  <PieChart />
                </ChartCard>
                <ChartCard title='设备区域统计'>
                  <PieChart />
                </ChartCard>
                <ChartCard title='设备状态统计'>
                  <PieChart />
                </ChartCard>
              </div>
            </div>
            <div class={styles['alarm-statistic']}>
              <AlarmStatisticsBar />
              <div class={styles['alarm-card-container']}>
                <ChartCard title='报警等级占比'>
                  <PieChart />
                </ChartCard>
                <ChartCard title='报警区域Top5'>
                  <RankingStripType />
                </ChartCard>
              </div>
              <div class={styles['alarm-charts']}>
                <ChartCard title='报警事件次数统计'>
                  <LineCharts />
                </ChartCard>
              </div>
            </div>
          </>

        )
      }
    }
    return (): JSX.Element => (
      <div class={styles['data-center']}>
        <GLayout title='数据中心' v-slots={layoutSlots} showSearch={false} />
      </div>
    )
  }
})
