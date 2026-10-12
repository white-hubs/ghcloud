import { defineComponent } from 'vue'
import { RoundDotValue } from '../round-dot-value'
import styles from './index.module.less'
import { getLocalAssetsFile } from '@/utils/common'
export const DeviceStatisticsBar = defineComponent({
  setup: () => {
    const deviceAmountIcon = getLocalAssetsFile('device-amount-icon.png')
    return (): JSX.Element => (
      <div class={styles['device-statistic-bar']}>
        <div class={styles.amount}>
          <div class={styles['icon-container']}>
            <img src={deviceAmountIcon} alt='' srcset='' />
          </div>
          <div class={styles['amount-content']}>
            <div>设备总数</div>
            <div class={styles.count}>323</div>
          </div>

        </div>
        <div class={styles.line} />
        <div class={styles.item}>
          <RoundDotValue />
          <div class={styles.count}>
            323
          </div>
        </div>
        <div class={styles.line} />
        <div class={styles.item}>
          <RoundDotValue />
          <div class={styles.count}>
            323
          </div>
        </div>
      </div>
    )
  }
})
