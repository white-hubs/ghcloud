import { Select } from 'ant-design-vue'
import { defineComponent, reactive, onMounted } from 'vue'
import { cubeAssetManagementService } from '../../../api/service'
import type { AssetClassifyType } from '@ghcloud/cube-asset-management-service'


export const PropertyTypeSelect = defineComponent({
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
      options: AssetClassifyType[];
    }>({
      options: []
    })
    onMounted(async () => {
      const response = await cubeAssetManagementService.getAssemblyClassifyPage({ pageNumber: 1, pageSize: 1000, type: 'assetType' })
      state.options = response.records
    })
    const handleFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as AssetClassifyType
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
        placeholder='请选择资产类型'
        show-search={props.showSearch}
        filterOption={props.showSearch ? handleFilterOption : undefined}
        onUpdate:value={(value) => {
          emit('update:value', value)
        }}
      />
    )
  }
})