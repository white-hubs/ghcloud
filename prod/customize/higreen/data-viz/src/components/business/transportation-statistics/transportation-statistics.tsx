
import { Card } from '@/components/card/card'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import style from './transportation-statistics.module.less'
import { StatCard } from '../car-statistics/stat-card'
import { SubTitle } from '@/components/sub-title/sub-title'
import { OverviewChartBar } from '../incoming-statistics/components/overview-chart-bar'
import { LineChart } from '@/components/line-chart/line-chart'
import dayjs from 'dayjs'
import { cubeTransportStatisticsService } from '@/api/service'
import { useApiTimer } from '@/hook/use-utils'

/** 转运统计业务卡片 */
export const TransportationStatistics = defineComponent({
  setup () {
    const dataList = ref([
      {
        name: '昨日转运托数',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/piece1.png',
        value: 0,
        unit: '托',
        // ratio: 6.8
      },
      {
        name: '昨日转运件数',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/piece2.png',
        value: 0,
        unit: '件',
        // ratio: 6.8
      },
      {
        name: '昨日转运车辆数',
        iconUrl: '/apps/@ghcloud/higreen-data-viz/icons/food-safety/car3.png',
        value: 0,
        unit: '辆',
        // ratio: 6.8
      }
    ])
    const getLastWeekDates = (): string[] => {
      let dates = []
      const sevenDaysAgo = dayjs().subtract(8, 'day').format('MM.DD')
      dates = [1, 2, 3, 4, 5, 6, 7].map(item => {
        return dayjs(sevenDaysAgo).add(item, 'day').format('MM.DD')
      })
      return dates
    }
    const barData = reactive({
      xData: getLastWeekDates(),
      yData: [
        {
          data: [0, 0, 0, 0, 0, 0, 0],
          color: ['rgba(36, 203, 165, 1)', 'rgba(42, 232, 189, 0)']
        }
      ]
    })
    const lineData = reactive({
      yAxis: { name: '件', interval: null },
      xData: getLastWeekDates(),
      legendData: ['普采转运件数', '快驴转运件数'],
      seriesData: [
        {
          name: '普采转运件数',
          color: '#428CF1',
          LinearGradientConfig: {
            offsetZeroColor: 'rgba(54, 161, 255,0.40)',
            offsetOneColor: 'rgba(25, 104, 255,0.00)'
          },
          data: [0, 0, 0, 0, 0, 0, 0]
        },
        {
          name: '快驴转运件数',
          color: '#3DE6FF',
          LinearGradientConfig: {
            offsetZeroColor: 'rgba(61,230,255,0.40)',
            offsetOneColor: 'rgba(25,204,255,0.00)'
          },
          data: [0, 0, 0, 0, 0, 0, 0]
        },
      ]
    })
    const getTransportWeekData = async (): Promise<void> => {
      const params = {
        begin: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD')
      }
      const res = await cubeTransportStatisticsService.getTransportWeek(params)
      const timeList = getLastWeekDates()
      const result = timeList.map(t => {
        const obj = {
          date: t,
          normalPieceCount: 0,
          quickPieceCount: 0
        }
        res?.forEach(item => {
          const day = item.enterDate ? dayjs(item.enterDate).format('MM.DD') : ''
          if (day === t) {
            obj.normalPieceCount = item.normalPieceCount ?? 0
            obj.quickPieceCount = item.quickPieceCount ?? 0
          }
        })
        return obj
      })

      lineData.seriesData[0].data = result.map(item => item.normalPieceCount)
      lineData.seriesData[1].data = result.map(item => item.quickPieceCount)
    }
    const getTransportYesterdayData = async (): Promise<void> => {
      const params = {
        deliveryDate: dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      }
      const res = await cubeTransportStatisticsService.getTransportYesterday(params)
      dataList.value[0].value = res.transportCount ?? 0
      dataList.value[1].value = res.pieceCount ?? 0
      dataList.value[2].value = res.carCount ?? 0
    }
    const getStatLoadTrendData = async (): Promise<void> => {
      const params = {
        period: [dayjs().subtract(7, 'day').format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')].join(',')
      }
      const res = await cubeTransportStatisticsService.getStatLoadTrend(params)
      const timeList = getLastWeekDates()
      const result = timeList.map(t => {
        const obj = {
          date: t,
          value: 0,
        }
        res?.forEach(item => {
          const day = item?.trendX ? dayjs(item.trendX).format('MM.DD') : ''
          if (day === t) {
            obj.value = item.trendY ? Number(item.trendY) : 0
          }
        })
        return obj
      })
      barData.yData[0].data = result.map(item => item.value)
    }
    onMounted(() => {
      useApiTimer(async () => {
        getTransportYesterdayData()
        getTransportWeekData()
        getStatLoadTrendData()
      })
    })
    const cardSlots = {
      'card-stat': (): JSX.Element => {
        return (
          <StatCard dataList={dataList.value} isTransport />
        )
      },
      'card-charts': (): JSX.Element => {
        return (
          <>
            <SubTitle title='近一周转运件数趋势' />
            <div class={style.chart}>
              <LineChart yAxis={lineData.yAxis} xData={lineData.xData} legendData={lineData.legendData} seriesData={lineData.seriesData} />
            </div>
            <SubTitle title='近一周装货车辆趋势图' />
            <div class={style.mt10}>
              <OverviewChartBar isTransport yData={barData.yData} xData={barData.xData} title='次' />
            </div>
          </>
        )
      },
    }
    return (): JSX.Element => (
      <Card title='转运统计' v-slots={cardSlots} titleIcon='/apps/@ghcloud/higreen-data-viz/icons/card-title/transportation.webp' class={style['transportation-statistics']} />
    )
  }
})
