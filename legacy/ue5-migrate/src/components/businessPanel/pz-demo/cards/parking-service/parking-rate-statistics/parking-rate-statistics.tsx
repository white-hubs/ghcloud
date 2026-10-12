import { defineComponent, ref, onMounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import styles from './parking-rate-statistics.module.less'
import WaterPolo from "@/components/businessPanel/public/charts/waterPolo/waterPolo.vue"
import { PZService } from '../../../card-service/service'

export const ParkingRateStatistics = defineComponent({
  name: 'ParkingRateStatistics',
  setup () {
    const totalSpaces = ref(100)
    const usedSpaces = ref(10)
    const faultRate = ref<number>(10);

    const getData = async (): Promise<void> => {
      const res = await PZService.parking.getParkingRateStatistics()
      const { parkCount, parkRate, totalParkCount } = res
      totalSpaces.value = totalParkCount ?? 0
      usedSpaces.value = parkCount ?? 0
      faultRate.value = parkRate ?? 0
    }

    onMounted(() => {
      getData()
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='停车率统计'>
        <div class={['card-container-3', styles.container]}>
          <WaterPolo title="" value={faultRate.value} unit="%" bgColor="rgba(59, 130, 246, 0.8)" color="rgba(59, 130, 246, 0.8)"></WaterPolo>
          <div class={styles.statsContainer}>
            <div class={styles.statItem}>
              <div class={styles.statLabel}>总车位数</div>
              <div class={styles.statValue}>{totalSpaces.value}</div>
            </div>
            <div class={styles.statItem}>
              <div class={styles.statLabel}>已停车位</div>
              <div class={styles.statValue}>{usedSpaces.value}</div>
            </div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})