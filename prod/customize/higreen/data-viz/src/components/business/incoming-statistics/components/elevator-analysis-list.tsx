
import { defineComponent, type PropType } from 'vue'
import styles from './elevator-analysis-list.module.less'

interface CategoryData {
  color: string;
  name: string;
  value: number;
}

export const ElevatorAnalysisList = defineComponent({
  props: {
    categoryData: {
      type: Array as PropType<CategoryData[]>,
      required: true,
      default: () => []
    }
  },
  setup (props) {
    const calculatePercentage = (item: CategoryData): string => {
      const total = props.categoryData.reduce((prev, curr) => prev + curr.value, 0)
      if (total === 0) {
        return '0'
      } else {
        return `${((item.value / total) * 100).toFixed(1)}%`
      }
    }
    return (): JSX.Element => (
      <div class={styles['analysis-list']}>
        {
          props.categoryData.map((item: CategoryData) => {
            return (
              <div class={styles['analysis-item']} key={item.name}>
                <div class={styles['analysis-item-title-wrapper']}>
                  <div class={styles['analysis-item-color']} style={{ background: item.color }} />
                  <div class={styles['analysis-item-title']}>{item.name}</div>
                </div>
                <div class={styles['analysis-item-value']}>{calculatePercentage(item)}</div>
              </div>
            )
          })
        }
      </div>
    )
  }
})
