import { Select } from '@ghcloud/cube-ui'
import { defineComponent, type PropType } from 'vue'

/** 巡检标签 */
export const InspectTagSelect = defineComponent({
  props: {
    value: {
      type: String as PropType<string>,
      default: undefined
    }
  },
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    const options = [
      {
        value: 'CHARGE',
        label: '违规充电'
      },
      {
        value: 'PARKING',
        label: '违规停放'
      }
    ]
    return (): JSX.Element => (
      <Select v-model:value={props.value} onUpdate:value={(value) => {
        emit('update:value', value)
      }} onChange={(value: unknown, option: unknown) => {
        emit('change', value, option)
      }} options={options} placeholder='请选择标签' />
    )
  }
})
