import { defineComponent, type PropType } from 'vue'
import { Card } from '../custom-card'
import { PieChart } from '../../../../../components/pie-chart'
import styles from './index.module.less'
import type { SnapshotVo } from '../../details'
export const AlarmDataSnap = defineComponent({
  props: {
    snapshotData: {
      type: Array as PropType<SnapshotVo[]>,
      default: () => []
    },
  },

  setup: (props) => {
    return (): JSX.Element => (
      <>
        {props.snapshotData.map(item => {
          return (
            <Card title={item.propName} key={item.propCode}>
              <div class={styles.alarmDataSnap}>
                <PieChart value={Number(item.propValue)} label={item.propName} max={item.maxValue} min={item.minValue} unit={item.unit} />
              </div>
            </Card>
          )
        })}
      </>

    )
  }
})
