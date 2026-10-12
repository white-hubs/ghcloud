import { Select } from 'ant-design-vue'
import { defineComponent, reactive, onMounted } from 'vue'
import { cubeDeviceCenterService } from '../../../api/service'
import type { DeviceTagDetail } from '@ghcloud/cube-iot-center-service'

export const DeviceTagSelect = defineComponent({
  props: {
    value: {
      type: String || Array || undefined,
      default: undefined
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
      options: DeviceTagDetail[];
    }>({
      options: []
    })
    onMounted(async () => {
      const response = await cubeDeviceCenterService.getCustomerTagListAll({ status: 1 })
      state.options = response
    })
    const handleFilterOption = (input: string, option: unknown): boolean => {
      const optionNode = option as DeviceTagDetail
      return optionNode.tagName?.toLowerCase().includes(input.toLowerCase()) ?? false
    }
    return (): JSX.Element => (
      <Select
        {...props}
        v-model:value={props.value}
        mode={props.multiple ? 'multiple' : undefined}
        options={state.options}
        fieldNames={{
          label: 'tagName',
          value: 'tagCode'
        }}
        onChange={(value: unknown, option: unknown) => {
          emit('change', value, option)
        }}
        onUpdate:value={(value) => {
          emit('update:value', value)
        }}
        allowClear
        placeholder='请选择设备标签'
        filterOption={props.showSearch ? handleFilterOption : undefined}
      />
    )
  }
})