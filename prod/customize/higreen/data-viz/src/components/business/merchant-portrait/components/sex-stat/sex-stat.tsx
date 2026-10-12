import { defineComponent } from 'vue'
import styles from './index.module.less'
import { CountTo } from 'vue3-count-to'
export const SexStat = defineComponent({
  props: {
    dataList: {
      type: Array as () => { name: string; icon: string; value: string; }[],
      default: [
        {
          name: '女',
          icon: '/apps/@ghcloud/higreen-data-viz/images/merchant/female.png',
          value: 25
        },
        {
          name: '男',
          icon: '/apps/@ghcloud/higreen-data-viz/images/merchant/male.png',
          value: 75
        }
      ]
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        <div class={[styles['pic-bg-card']]}>
          <img class={styles['animation-pulse']} src='/apps/@ghcloud/higreen-data-viz/images/merchant/man-icon.png' alt='' />
        </div>
        <div class={styles['stat-card']}>
          {props.dataList.map((item, index) => {
            return (
              <div class={styles['stat-item']} key={index}>
                <div class={styles['item-label']}>
                  <img src={item.icon} alt='' srcset='' />
                  <span>{item.name}</span>
                </div>
                <div class={styles['item-value']}><CountTo startVal={0} endVal={Number(item.value)} duration={2000} />%</div>
              </div>
            )
          })}

          {/* <div class={styles['stat-item']}>
            <div class={styles['item-label']}>
              <img src='/images/merchant/male.png' alt='' srcset='' />
              <span>男</span>
            </div>
            <div class={styles['item-value']}>75%</div>
          </div> */}
        </div>
      </div>
    )
  }
})
