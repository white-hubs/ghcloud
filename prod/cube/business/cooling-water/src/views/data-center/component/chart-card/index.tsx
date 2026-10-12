import { defineComponent } from 'vue'
import styles from './index.module.less'
import { Select } from '@ghcloud/cube-ui'
export const ChartCard = defineComponent({
  props: {
    title: {
      type: String,
      defalut: () => '报警类型占比'
    },
    selectOption: {
      type: Array,
      default: () => []
    },
    selectPlaceholder: {
      type: String,
      defalut: () => '请选择离线设备'
    },
    value: {
      type: String,
      default: () => ''
    },
    selectFieldNames: {
      type: Object,
      default: { label: 'name', value: 'id' }
    }
  },
  emits: ['update:value'],
  setup: (props, { slots, emit }) => {
    const handleChangeSelect = (value: string): void => {
      emit('update:value', value)
    }
    return (): JSX.Element => (
      <div class={styles['chart-card']}>
        <div class={styles['card-title']}>
          <div>{props.title}</div>
          {props.selectOption.length !== 0 && <Select v-model:value={props.value} options={props.selectOption} fieldNames={props.selectFieldNames} onChange={handleChangeSelect} />}
        </div>
        <div class={styles['chart-content']}>
          {slots.default?.()}
        </div>
      </div>
    )
  }
})
