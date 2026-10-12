import { defineComponent, onMounted, reactive } from 'vue'
import styles from './index.module.less'
import { SubTitle } from '@/components/sub-title/sub-title'
import { LineChart } from '@/components/line-chart/line-chart'
import { cubeFoodSafetyService } from '@/api/service'
import dayjs from 'dayjs'
import { useApiTimer } from '@/hook/use-utils'

export const FoodSafetyCheckChart = defineComponent({
  setup: () => {
    const state = reactive<{
      xData: string[];
      seriesData: {
        name: string;
        color: string;
        LinearGradientConfig: {
          offsetZeroColor: string;
          offsetOneColor: string;
        };
        data: number[];
      }[];
    }>({
      xData: [],
      seriesData: [{
        name: '次数',
        color: '#02EDB2',
        LinearGradientConfig: {
          offsetZeroColor: 'rgba(65,228,187,0.40)',
          offsetOneColor: 'rgba(65,228,187,0.00)'
        },
        data: [75, 25, 35, 44, 90, 40, 50]
      }]
    })
    onMounted(() => {
      useApiTimer(getData)
    })
    const getData = async (): Promise<void> => {
      const startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
      const endDate = dayjs().format('YYYY-MM-DD')
      const res = await cubeFoodSafetyService.getFoodSafetyCheckTrend({
        period: [startDate, endDate].join(','),
        format: '%Y-%m-%d'
      })
      const initData = [6, 5, 4, 3, 2, 1, 0].map(item => {
        return {
          trendX: dayjs(startDate).add(item, 'day').format('YYYY-MM-DD'),
          trendY: '0'
        }
      }).reverse()
      const data = initData.map(item => {
        const resItem = res.find(resItem => resItem.trendX === item.trendX)
        return {
          ...item,
          trendY: resItem ? resItem.trendY : '0'
        }
      })
      state.xData = data.map(item => dayjs(item.trendX).format('MM.DD'))
      state.seriesData[0].data = data.map(item => Number(item.trendY))
    }
    return (): JSX.Element => (
      <div class={styles.container}>
        <SubTitle title='近一周食安检测次数' />
        <div class={styles.chart}>
          <LineChart xData={state.xData} seriesData={state.seriesData} />
        </div>
      </div>
    )
  }
})
