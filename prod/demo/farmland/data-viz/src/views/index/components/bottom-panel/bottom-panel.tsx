import { defineComponent } from 'vue'
import styles from './bottom-panel.module.less'
import { GrainProductionCard } from '../cards/grain-production-card/grain-production-card'
import { HighStandardFarmlandCard } from '../cards/high-standard-farmland-card/high-standard-farmland-card'

export const BottomPanel = defineComponent({
  setup () {
    return (): JSX.Element => (
      <div class={styles['bottom-panel-container']}>
        <HighStandardFarmlandCard />
        <GrainProductionCard />
      </div>
    )
  }
})