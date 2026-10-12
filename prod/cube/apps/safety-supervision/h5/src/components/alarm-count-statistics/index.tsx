
import { computed, defineComponent, type PropType } from 'vue'
import styles from './index.module.less'
import { getAssetsFile } from '@/utils'
interface DataSourceItem {
  title: string; // 标题
  count: string | number; // 报警数
  ratio: number;// 环比
  field?: string; // 字段
  unit?: string;// 单位
}
/** 报警处理排名 - 统计 */
export const AlarmCountStatistics = defineComponent({
  props: {
    dataSource: {
      type: Array as PropType<DataSourceItem[]>,
      default: () => [
        { title: '燃气报警数', count: '0', field: 'all', ratio: 10, unit: '%' },
        { title: '未处理报警数', count: '0', field: 'unhandle', ratio: -10, unit: '%' },
        { title: '已处理报警数', count: '0', field: 'handle', ratio: -10 },
      ]
    },
    currentActive: {
      type: String,
      default: 'all'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['change'],
  setup (props, { emit }) {
    const activeField = computed(() => {
      if (props.dataSource.map(item => item.field).includes(props.currentActive)) {
        return props.currentActive
      }
      return props.dataSource[0].field
    })
    const handleClickItem = (field: string): void => {
      emit('change', field)
    }
    return (): JSX.Element =>
      <div class={[styles.container, props.dataSource.length === 2 && styles.container_two]}>
        {props.dataSource.map((item, index) => {
          return (
            <div class={[styles.item, item.field === activeField.value && !props.disabled && styles.active]} onClick={() => {
              item.field && handleClickItem(item.field)
            }} key={index}>
              <div class={styles.title}>{item.title}</div>
              <div class={styles.count}> <span>{item.count}</span> <span class={styles.unit}>{item.unit}</span> </div>
              <div class={styles.ratio}>
                环比 <span class={[styles.ratio_num, item.ratio > 0 && styles.ratio_up]}>{item.ratio > 0 ? `+${item.ratio}` : item.ratio}%</span>
                {item.ratio > 0 && <img src={getAssetsFile('ratio-up.png')} alt='' />}
                {
                  item.ratio < 0 && <img src={getAssetsFile('ratio-down.png')} class={styles.img_down} alt='' />
                }
              </div>
            </div>
          )
        })}
      </div>
  }
})
