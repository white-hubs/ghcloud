import { defineComponent } from 'vue'
import styles from './index.module.less'
import { SubInTitle } from '../sub-in-title/sub-in-title'
import { TriangleBarChart } from '../triangle-bar-chart/triangle-bar-chart'
export const TriangleBarCard = defineComponent({
  props: {
    title: {
      type: String,
      default: '籍贯'
    },
    dataList: {
      type: Array as () => number[],
      default: () => [65, 15, 8, 5, 5]
    },
    xData: {
      type: Array as () => string[],
      default: () => ['广东', '湖南', '广西', '江西', '福建']
    }
  },
  setup: (props) => {
    return (): JSX.Element=> (
      <div class={styles.container}>
        <SubInTitle title={props.title} />
        <div class={styles.content}>
          <TriangleBarChart dataList={props.dataList.slice(0, 5)} xData={props.xData.slice(0, 5)} />
        </div>
      </div>
    )
  }
})
