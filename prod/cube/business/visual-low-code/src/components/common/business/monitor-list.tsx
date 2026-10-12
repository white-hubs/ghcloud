import { defineComponent, type PropType } from 'vue'
import styles from './style/monitor-list.module.less'
interface List {
  name: string;
  color: string;
  value: number;
}
export default defineComponent({
  name: 'Lighting-round',
  props: {
    monitorData: {
      type: Array as PropType<List[]>
    }
  },
  setup: (props) => {
    return () =>
      <div class={styles.monitor}>
        <div class={styles.monitorBox}>
          {
                props.monitorData?.map((item, index) =>
                  <div key={index}>
                    <div class={styles.monitorList}>
                      <div class={styles.monitorColor} style={{ background: `${item.color}` }} />
                      <div> {item.name} </div>
                    </div>
                    <div>{item.value} </div>
                  </div>)
            }
        </div>
      </div>
  }
})
