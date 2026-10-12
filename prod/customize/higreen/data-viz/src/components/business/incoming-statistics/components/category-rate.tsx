
import { defineComponent, onMounted, reactive, ref, watch, type PropType } from 'vue'
import { SubTitle } from '@/components/sub-title/sub-title'
import { ElevatorAnalysisPie } from './elevator-analysis-pie'
import { ElevatorAnalysisList } from './elevator-analysis-list'
import styles from '../incoming-statistics.module.less'
import { OverviewChartBar } from './overview-chart-bar'
import dayjs from 'dayjs'
import type { VehicleStatTrend } from '@ghcloud/cube-bi-data-management/src/vehicle-statistics.service'
import { cubeBiDataManagementService } from '@/api/service'
import { useApiTimer } from '@/hook/use-utils'
interface DataType {
  mainCateGory: string;
  mainCateGoryName: string;
  netWeight: number;
}
interface GoodsWeek {
  mainCateGory: string;
  mainCateGoryName: string;
  netWeight: string;
  days: number;
  percent: string;
}
/** 昨日来货量品类占比 */
export const CategoryRate = defineComponent({
  props: {
    yesterdayData: {
      type: Array as PropType<DataType[]>,
      default: () => []
    }
  },
  setup (props) {
    const weekData = ref()
    const selectType = ref('1001')
    const colors = ['#29C2FF', '#74AEE7', '#FFC700', '#655DD1', '#B9D9FF', '#6EE3E1']

    watch(() => props.yesterdayData, () => {
      pieData.value = props.yesterdayData.map((x: DataType, i: number) => {
        return { value: Number(x.netWeight) / 1000, name: x.mainCateGoryName, color: colors[i] }
      })
    })
    const pieData = ref<{ value: number; name: string; color: string; }[]>([])
    const barData = reactive<{
      xData: string[];
      yData: {
        data: number[];
        color: string[];
      }[];
    }>({
      xData: [],
      yData: [
        {
          data: [],
          color: ['#2AE8BD', 'rgba(56, 168, 217, 0)']
        }
      ]
    })
    const trendIncoming = [
      { label: '蔬菜类', value: '1001', color: '#2AE8BD' },
      { label: '肉类', value: '1002', color: '#E84732' },
      { label: '禽类', value: '1003', color: '#EEC06D' },
      { label: '综合副食', value: '1016', color: '#38A8D9' },
      { label: '冻品', value: '1006', color: '#45DADA' },
      { label: '水果类', value: '1007', color: '#5BD06F' },
      { label: '水产', value: '1005', color: '#92B4E5' },
    ] 
    const changeType = (code: string): void => {
      selectType.value = code
      barData.yData[0].color[0] = trendIncoming.find(x => x.value === code)?.color || '#2AE8BD'
      processingTrendData(weekData.value)
    }
    const processingTrendData = (data: GoodsWeek[]): void => {
      const chertData: VehicleStatTrend[] = []
      data.forEach(e => {
        if (e.mainCateGory === selectType.value) {
          chertData.push({ trendX: dayjs(e.days).format('MM.DD'), trendY: Number(e.netWeight) })
        }
      })
      const sevenDaysAgo = dayjs().subtract(8, 'day').format('MM.DD')
      const initData = [1, 2, 3, 4, 5, 6, 7].map(item => {
        return {
          trendX: dayjs(sevenDaysAgo).add(item, 'day').format('MM.DD'),
          trendY: '0'
        }
      })
      const mergedData = initData.map(bItem => {
        const aItem = chertData.find(aItem => aItem.trendX === bItem.trendX)
        return {
          trendX: bItem.trendX,
          trendY: Number(aItem ? aItem.trendY : bItem.trendY)
        }
      })
      barData.xData = mergedData.map((x: VehicleStatTrend) => x.trendX)
      barData.yData[0].data = mergedData.map((x: VehicleStatTrend) => {
        return x.trendY ? Number(x.trendY) / 1000 : 0
      })
    }
    const time = ref()
    const getGoodsWeekEvent = async (): Promise<void> => {
      time.value && clearInterval(time.value)
      const begin = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
      const end = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      weekData.value = await cubeBiDataManagementService.getGoodsWeek({ begin, end })
      processingTrendData(weekData.value)
      let index = 1
      time.value = setInterval(() => {
        const value = trendIncoming[index].value
        changeType(value)
        if (index === trendIncoming.length - 1) {
          index = 0
        } else {
          index++
        }
      }, 3000)
    }
    onMounted(async () => {
      useApiTimer(getGoodsWeekEvent)
    })
    return (): JSX.Element => (
      <div>
        <SubTitle title='昨日来货量品类占比' />
        <div class={styles['elevator-analysis-box']}>
          <ElevatorAnalysisPie categoryData={pieData.value} />
          <ElevatorAnalysisList categoryData={pieData.value} />
        </div>
        <SubTitle title='近一周来货量趋势图' />
        <div class={styles['trend-incoming-goods']}>
          {
            trendIncoming.map(item => {
              return (
                <div key={item.value} class={`${styles['trend-incoming-goods-item']} ${selectType.value === item.value ? styles.activation : ''}`}>
                  <span class={styles['item-color']} style={{ background: item.color }} />
                  <span class={styles['item-title']}>{item.label}</span>
                </div>
              )
            })
          }
        </div>
        <OverviewChartBar gridLeft='10%' yData={barData.yData} xData={barData.xData} title='吨' />
      </div>
    )
  }
})
