import { defineComponent } from 'vue'
import styles from './left-panel.module.less'
import { GrainPlanting } from '../cards/grain-planting/grain-planting'
import { FarmlandUsage } from '../cards/farmland-usage/farmland-usage'
import { CultivatedLand } from '../cards/cultivated-land/cultivated-land'

export const LeftPanel = defineComponent({
  setup () {
    return (): JSX.Element => (
      <div class={styles['left-panel-container']}>
        <GrainPlanting />
        <FarmlandUsage />
        <CultivatedLand />
      </div>
    )
  }
})