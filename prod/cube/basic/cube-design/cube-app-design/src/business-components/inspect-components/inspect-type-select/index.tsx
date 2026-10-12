import { defineComponent, onMounted, reactive, type PropType } from 'vue'
import { Select } from 'ant-design-vue'
type OptionsVo = {
  id: string;
  name: string;
}[]
export const InspectTypeSelect = defineComponent({
  props: {
    optionsFetchApi: {
      type: Function as PropType<() => Promise<OptionsVo>>,
    },
    value: {
      type: String as PropType<string>,
      default: ''
    }
  },
  emits: ['update:value'],
  setup: (props, { emit }) => {
    const state = reactive({
      options: [] as OptionsVo
    })

    onMounted(async () => {
      if (!props.optionsFetchApi) return
      const result = await props.optionsFetchApi()
      state.options = result
    })

    return (): JSX.Element => (
      <Select placeholder='请选择巡检类型' v-model:value={props.value} allowClear onUpdate:value={(value) => {
        emit('update:value', value)
      }} options={state.options} fieldNames={{ label: 'name', value: 'id' }} />
    )
  }
})
