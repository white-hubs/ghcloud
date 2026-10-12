
import { Card } from '@/components/card/card'
import { defineComponent, onMounted, reactive, ref } from 'vue'
import style from './incoming-statistics.module.less'
import { StatisticsCard } from './components/statistics-card'
import { CategoryRate } from './components/category-rate'
import { cubeBiDataManagementService } from '@/api/service'
import dayjs from 'dayjs'
import { useApiTimer } from '@/hook/use-utils'

/** 来货统计业务卡片 */
export const IncomingStatistics = defineComponent({
  setup () {
    const yesterdayData = ref()
    const getData = async (): Promise<void> => {
      const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
      yesterdayData.value = await cubeBiDataManagementService.getGoodsYesterday(yesterday)
      statisticsData.ratio = yesterdayData.value.percent
      statisticsData.value = yesterdayData.value.goodsCount / 1000
    }
    onMounted(() => {
      useApiTimer(getData)
    })
    const statisticsData = reactive({
      ratio: 0.5,
      value: 400
    })
    const cardSlots = {
      'card-stat': (): JSX.Element => {
        return (
          <StatisticsCard ratio={statisticsData.ratio} value={statisticsData.value} />
        )
      },
      'card-charts': (): JSX.Element => {
        return (
          <CategoryRate yesterdayData={yesterdayData.value?.list} />
        )
      },
    }
    return (): JSX.Element => (
      <Card title='来货统计' class={style['incoming-statistics']} v-slots={cardSlots} />
    )
  }
})
