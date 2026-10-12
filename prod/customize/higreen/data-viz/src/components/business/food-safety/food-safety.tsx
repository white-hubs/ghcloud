import { Card } from '@/components/card/card'
import { defineComponent } from 'vue'
import style from './food-safety.module.less'
import { StatCard } from './components/stat-card/stat-card'
import { FoodSafetyCheckChart } from './components/food-safety-check-chart/food-safety-check-chart'
import { RiskGoodsRank } from './components/risk-goods-rank/risk-goods-rank'
/** 食品安全业务卡片 */
export const FoodSafety = defineComponent({
  setup () {
    const cardSlots = {
      'card-stat': (): JSX.Element => {
        return <StatCard />
      },
      'card-charts': (): JSX.Element => {
        return (
          <>
            <FoodSafetyCheckChart />
            <RiskGoodsRank />
          </>
        )
      },
    }
    return (): JSX.Element=> (
      <Card title='食品安全' v-slots={cardSlots} titleIcon='/apps/@ghcloud/higreen-data-viz/icons/card-title/safety.webp' class={style['food-safety']} />
    )
  }
})
