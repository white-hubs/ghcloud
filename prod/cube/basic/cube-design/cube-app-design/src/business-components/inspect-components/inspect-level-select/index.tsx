import { defineComponent, type PropType } from 'vue'
import { Select } from 'ant-design-vue'
export const InspectLevelSelect = defineComponent({
  props: {
    value: {
      type: String as PropType<string>,
      default: ''
    }
  },
  emits: ['update:value'],
  setup: (props, { emit }) => {
    const options = [{ name: '普通', id: 'GENERAL' }, { name: '紧急', id: 'URGENT' }]
    return (): JSX.Element => (
      <Select v-model:value={props.value} onUpdate:value={(value) => {
        emit('update:value', value)
      }} options={options} fieldNames={{ label: 'name', value: 'id' }} />
    )
  }
})
