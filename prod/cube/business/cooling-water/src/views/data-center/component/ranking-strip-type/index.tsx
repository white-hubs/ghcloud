import { defineComponent } from 'vue'
import styles from './index.module.less'
import { getLocalAssetsFile } from '@/utils/common'
export const RankingStripType = defineComponent({
  setup: () => {
    const upIcon = getLocalAssetsFile('rise.png')
    const testData = [
      {
        name: '区域名称名称',
        ratio: 80,
        amount: 448,
        qaqRatio: '-10%',
      },
      {
        name: '区域名称',
        ratio: 70,
        amount: 332,
        qaqRatio: '+10%',
      },

      {
        name: '区域名称',
        ratio: 60,
        amount: 280,
        qaqRatio: '+10%',
      },
      {
        name: '区域名称',
        ratio: 50,
        amount: 240,
        qaqRatio: '+10%',
      },
      {
        name: '区域名称',
        ratio: 40,
        amount: 200,
        qaqRatio: '+10%',
      },
    ]
    const rankColor = ['rgba(251, 163, 63, 1)', 'rgba(251, 163, 63, 0.70)', 'rgba(251, 163, 63, 0.50)', 'rgba(225, 225, 225, 1)', 'rgba(225, 225, 225, 1)']
    const proportionColor = ['rgba(158, 190, 255, 1)', 'rgba(126, 168, 255, 1)', 'rgba(86, 140, 251, 1)', 'rgba(24, 144, 255, 1)', 'rgba(24, 144, 255, 1)']
    const downIcon = getLocalAssetsFile('decline.png')
    return (): JSX.Element => (
      <div class={styles['ranking-strip-type']}>
        {testData.map((item, index) => {
          return (
            <div class={styles.item} key={index} style={{ background: index % 2 === 1 ? 'none' : '#FBFCFF' }}>
              <div class={styles.ranking} style={{ background: rankColor[index] }}>{index + 1}</div>
              <div class={styles.label}>{item.name}</div>
              <div class={styles['total-Progress']}>
                <div class={styles['item-progress']} style={{ width: `${item.ratio}%`, background: proportionColor[index] }} />
              </div>
              <div class={styles.amount}>{item.amount}</div>
              <div class={styles.ratio}>
                <span class={styles['ratio-label']}>环比</span>
                <img src={item.qaqRatio.startsWith('+') ? upIcon : downIcon} alt='' />
                <span class={styles['ratio-value']} style={{ color: item.qaqRatio.startsWith('+') ? '#FF5454' : '#2CC966' }}>{item.qaqRatio}</span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }
})
