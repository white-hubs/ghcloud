import { Card } from '@/components/card/card'
import { defineComponent } from 'vue'
import style from './merchant-portrait.module.less'
import { StatCard } from './components/stat-card/stat-card'
import { Wholesaler } from './components/wholesaler/wholesaler'
import { Purchaser } from './components/purchaser/purchaser'
/** 商户画像业务卡片 */
export const MerchantPortrait = defineComponent({
  setup () {
    const cardSlots = {
      'card-stat': (): JSX.Element => {
        return <StatCard />
      },
      'card-charts': (): JSX.Element => {
        return (
          <>
            <Wholesaler />
            <Purchaser />
          </>
        )
      }
    }
    return (): JSX.Element => (
      <Card v-slots={cardSlots} title='商户画像' titleIcon='/apps/@ghcloud/higreen-data-viz/icons/card-title/user.webp' class={style['merchant-portrait']} />
    )
  }
})
