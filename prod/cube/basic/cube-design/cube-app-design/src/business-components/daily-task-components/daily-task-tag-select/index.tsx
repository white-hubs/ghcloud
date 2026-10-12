import { DailyTaskTagOptions } from '@ghcloud/cube-daily-task-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, type PropType } from 'vue'

/** 任务标签 */
export const DailyTaskTagSelect = defineComponent({
  props: {
    value: {
      type: String as PropType<string>,
      default: undefined
    }
  },
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    return (): JSX.Element => (
      <Select v-model:value={props.value} onUpdate:value={(value) => {
        emit('update:value', value)
      }} onChange={(value: unknown, option: unknown) => {
        emit('change', value, option)
      }} options={DailyTaskTagOptions} placeholder='请选择标签' />
    )
  }
})
