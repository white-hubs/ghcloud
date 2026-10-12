import { defineComponent } from 'vue'
import styles from './index.module.less'
import { SubInTitle } from '../sub-in-title/sub-in-title'
import { StripBarChart } from '../strip-bar-chart/strip-bar-chart'
export const StripBarCard = defineComponent({
  props: {
    title: {
      type: String,
      default: '上游来源'
    },
    dataList: {
      type: Array as () => number[],
      default: () => [80, 5, 5, 5]
    },
    xData: {
      type: Array as () => string[],
      default: () => ['广东', '宁夏', '湖北', '云南']
    }
  },
  setup: (props) => {
    return (): JSX.Element => (
      <div class={styles.container}>
        <SubInTitle title={props.title} />
        <div class={styles.content}>
          <StripBarChart dataList={props.dataList} xData={props.xData} />
        </div>
      </div>
    )
  }
})
