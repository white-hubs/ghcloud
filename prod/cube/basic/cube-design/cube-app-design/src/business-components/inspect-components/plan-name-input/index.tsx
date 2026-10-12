import { defineComponent, type PropType } from 'vue'
import { Input, message } from 'ant-design-vue'
import { promiseThrottle } from '../../../utils'
export const PlanNameInput = defineComponent({
  name: 'InspectPlanTaskName',
  props: {
    checkNameApi: {
      type: Function as PropType<(params: unknown) => Promise<boolean>>,
      required: true
    },
    value: {
      type: String,
      default: ''
    },
  },
  emits: ['update:value'],
  setup: (props, { emit }) => {
    const debounceCheckPlanName = promiseThrottle(props.checkNameApi, 1000)
    const handleInputChange = async (e: { target: { value?: string | undefined; }; }): Promise<void> => {
      const res = await debounceCheckPlanName({
        planName: e.target.value
      })
      if (res) {
        message.warning('计划名称重复')
      }
    }
    return (): JSX.Element => (
      <Input v-model:value={props.value} onInput={handleInputChange} onUpdate:value={(value) => {
        emit('update:value', value)
      }} />
    )
  }
})
