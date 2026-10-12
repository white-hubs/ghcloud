import { Select } from 'ant-design-vue'
import { defineComponent, reactive, onMounted } from 'vue'
import { cubeMaintainService } from '../../../api/service'
import type { InspectPointType } from '@ghcloud/cube-maintain-service'

export const InspectPointTypeSelect = defineComponent({
  props: {
    value: {
      type: String || Array,
      default: ''
    },
    multiple: {
      type: Boolean,
      default: false
    },
    filterEnabled: {
      type: Boolean,
      default: true
    },
    showSearch: {
      type: Boolean,
      default: true
    },
    maxTagCount: {
      type: Number,
    }
  },
  emits: ['update:value', 'change'],
  setup: (props, { emit }) => {
    const state = reactive<{
      options: InspectPointType[];
    }>({
      options: []
    })
    onMounted(async () => {
      const response = await cubeMaintainService.inspectPointTypeList()
      state.options = response
    })
    const handleFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as InspectPointType
      return optionNode.name.toLowerCase().includes(input.toLowerCase())
    }
    return (): JSX.Element => (
      <Select
        {...props}
        mode={props.multiple ? 'multiple' : undefined}
        allowClear
        onChange={(value: unknown, option: unknown) => {
          emit('change', value, option)
        }}
        options={state.options}
        fieldNames={{
          label: 'name',
          value: 'id'
        }}
        v-model:value={props.value}
        placeholder='请选择现场点类型'
        show-search={props.showSearch}
        filterOption={props.showSearch ? handleFilterOption : undefined}
        onUpdate:value={(value) => {
          emit('update:value', value)
        }}
      />
    )
  }
})