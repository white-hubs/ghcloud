import { defineComponent } from 'vue'
import styles from './right-panel.module.less'
import { AchievementCard } from '../cards/achievement-card/achievement-card'
import { FarmRentalCard } from '../cards/farm-rental-card/farm-rental-card'
import { FacilityFarmland } from '../cards/facility-farmland/facility-farmland'

export const RightPanel = defineComponent({
  setup () {
    return (): JSX.Element => (
      <div class={styles['right-panel-container']}>
        <AchievementCard />
        <FarmRentalCard />
        <FacilityFarmland />
      </div>
    )
  }
})