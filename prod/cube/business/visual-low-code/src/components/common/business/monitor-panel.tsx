import { getAssetsImge } from '@/utils/get-image'
import CountTo from './count-to/count-to.tsx'
import { defineComponent, type PropType } from 'vue'
import styles from './style/monitor-panel.module.less'
interface DataType {
  imgPath: string;
  value: number;
  name: string;
}
export default defineComponent({
  name: 'monitorPanel',
  props: {
    monitorPanelData: {
      type: Object as PropType<DataType>
    }
  },
  setup: (props) => {
    return () =>
      <div class={styles.monitorPanel}>
        <div class={styles['monitorPanel-left']}>
          <div class={styles.bg}>
            <img src={getAssetsImge('exception/over-view4.png')} alt='' />
            <img class={`${styles.rotate} ${styles['aniamtion-electric-fan']}`} src={getAssetsImge(`exception/${props.monitorPanelData?.imgPath ?? ''}`)} alt='' />
          </div>
        </div>
        <div class={styles['monitorPanel-right']}>
          <div class={styles['monitorPanel-data']}>
            <CountTo
              class={styles.count} startVal={0} endVal={props.monitorPanelData?.value} duration={2000}
              separator=''
            />
            <div class={styles['monitorPanel-line']} />
            <div class={styles['monitorPanel-name']}>{props.monitorPanelData?.name}</div>
          </div>
        </div>
      </div>
  }
})
