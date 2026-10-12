import { defineComponent } from 'vue'
import styles from './index.module.less'
const bgColors = [
  '#57b6f7',
  '#2AE8BD',
  '#0B66F0',
]
export const PieStatList = defineComponent({
  props: {
    dataList: {
      type: Array as () => {
        name: string;
        value: number;
      }[],
      default: () => [
        {
          name: '0-3吨',
          value: 15
        },
        {
          name: '3-5吨',
          value: 15
        },
        {
          name: '5吨以上',
          value: 70
        }
      ]
    }
  },
  setup (props) {
    return (): JSX.Element => (
      <div class={styles['pie-stat-list']}>
        {props.dataList.map((item, index) => {
          return (
            <div class={styles['pie-stat-item']} key={index}>
              <span class={styles['pie-stat-item-icon']} style={{ backgroundColor: bgColors[index] }} />
              <span class={styles['pie-stat-item-title']}>{item.name}</span>
              <span class={styles['pie-stat-item-value']}>{parseInt(String(item.value))}%</span>
              {/* <span class={styles['pie-stat-item-value']}>{item.value}%</span> */}
            </div>
          )
        })}

      </div>
    )
  }
})
