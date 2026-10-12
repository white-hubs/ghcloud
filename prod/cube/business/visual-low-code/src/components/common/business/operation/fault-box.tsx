import { defineComponent, type PropType } from 'vue'
import styles from './fault-box.module.less'
import CountTo from '.././count-to/count-to.tsx'
interface List {
  color: string;
  name: string;
  value: number;
}
export default defineComponent({
  name: 'FaultBox',
  props: {
    data: {
      type: Array as PropType<List[]>
    }
  },
  setup (props) {
    return () =>
      <div>
        {
          props.data?.map(item =>
            <div class={styles.faultBox} key={item.name}>
              <div class={styles['faultBox-left']}>
                <span class={styles['faultBox-data']} style={{ backgroundColor: `${item.color}` }} />
                <span class={styles['faultBox-value']}>{item.name}</span>
              </div>
              <div class={styles['faultBox-right']}>
                <CountTo startVal={0} endVal={item.value} duration={2000} separator='' />
              </div>
            </div>
          )
        }
      </div>
  }
})
