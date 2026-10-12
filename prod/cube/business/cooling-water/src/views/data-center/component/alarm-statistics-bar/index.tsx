import { defineComponent } from 'vue'
import { RoundDotValue } from '../round-dot-value'
import styles from './index.module.less'
import { getLocalAssetsFile } from '@/utils/common'
export const AlarmStatisticsBar = defineComponent({
  setup: () => {
    const alarmIcon = getLocalAssetsFile('alarm-icon.png')
    return (): JSX.Element => (
      <div class={styles['alarm-statistic-bar']}>
        <div class={styles.amount}>
          <div class={styles['icon-container']}>
            <img src={alarmIcon} alt='' srcset='' />
          </div>
          <div class={styles['amount-content']}>
            <div>报警总数</div>
            <div class={styles.count}>1687</div>
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
