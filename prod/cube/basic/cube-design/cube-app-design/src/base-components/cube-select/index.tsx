import { defineComponent, onMounted, reactive, type PropType } from 'vue'
import { Select } from 'ant-design-vue'
import type { DefaultOptionType } from 'ant-design-vue/es/select'
export const CubeSelect = defineComponent({
  props: {
    optionsFetchApi: {
      type: Function as PropType<() => Promise<DefaultOptionType[]>>,
    },
    options: {
      type: Array as PropType<DefaultOptionType[]>,
      default: () => []
    },
    value: {
      type: String as PropType<string> | null,
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    optionLabelProp: {
      type: String as PropType<string>,
      default: ''
    },
    placeholder: {
      type: String as PropType<string>,
      default: ''
    },
    optionFilterProp: {
      type: String as PropType<string>,
      default: ''
    },
    fieldNames: {
      type: Object as PropType<{ label: string; value: string; }>,
      default: () => ({ label: 'name', value: 'id' })
    }
  },
  emits: ['update:value'],
  setup: (props, { emit }) => {
    const state = reactive({
      options: [] as DefaultOptionType[]
    })

    onMounted(async () => {
      state.options = props.options
      if (!props.optionsFetchApi) return
      const result = await props.optionsFetchApi()
      state.options = result
    })

    return (): JSX.Element => (
      <Select v-model:value={props.value} placeholder={props.placeholder} onUpdate:value={(value) => {
        emit('update:value', value)
      }} options={state.options} fieldNames={props.fieldNames} />
    )
  }
})
