import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, computed, watch, nextTick } from 'vue'
import { cubeApplicationCenterService } from '@/api/service'
import type { TerminalEntity } from '@ghcloud/cube-application-center-service'

interface OptionItem {
  label: string;
  value: string;
}

type ValueType = string | string[] | undefined;

export const ClientSelect = defineComponent({
  props: {
    readonly: {
      type: Boolean,
      default: false
    },
    value: {
      type: [String, Array] as unknown as () => ValueType,
      default: undefined
    },
    options: {
      type: Array as () => OptionItem[],
      default: undefined
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:value', 'change', 'select'],
  setup (props, { emit }) {
    const clientData = ref<TerminalEntity[]>([])

    // 计算选项列表
    const options = computed<OptionItem[]>(() => {
      if (props.options) {
        return props.options
      }
      // clientData.value是数组
      return Array.isArray(clientData.value)
        ? clientData.value.map(item => ({
          label: item.name,
          value: item.id.toString()
        }))
        : []
    })

    // 获取原始应用数据
    const getSelectClient = (selectedValue: string): TerminalEntity | undefined => {
      return clientData.value.find(item => item.id === selectedValue)
    }

    // 获取多个原始应用数据
    const getMultipleClient = (selectedValues: string[]): TerminalEntity[] => {
      return clientData.value.filter(item => selectedValues.includes(item.id))
    }

    // 获取显示标签
    const getDisplayLabel = (selectedValue?: ValueType): string => {
      if (!selectedValue) return '--'

      if (Array.isArray(selectedValue)) {
        if (selectedValue.length === 0) return '--'

        return selectedValue
          .map(value => options.value.find(option => option.value === value)?.label ?? '--')
          .join(', ')
      }

      return options.value.find(option => option.value === selectedValue)?.label ?? '--'
    }

    // 获取应用列表
    const fetchApplications = async (): Promise<void> => {
      if (props.options) return

      try {
        const response = await cubeApplicationCenterService.getTerminals({
          pageNumber: 1,
          pageSize: 100,
        })
        clientData.value = response.records || []
      } catch {
        clientData.value = []
      }
    }

    // 处理值变化
    const handleValueChange = async (newValue: ValueType): Promise<void> => {
      // 先更新值
      emit('update:value', newValue)

      // 等待下一个tick确保值已经更新到父组件
      await nextTick()

      // 再触发change事件
      if (Array.isArray(newValue)) {
        const originalData = newValue.length > 0 ? getMultipleClient(newValue) : []
        emit('change', newValue, originalData)
      } else {
        const originalData = newValue ? getSelectClient(newValue) : undefined
        emit('change', newValue, originalData)
      }
    }

    // 处理选择事件
    const handleSelect = (selectedValue: string): void => {
      if (props.multiple) {
        // 多选模式下，selectedValue是单个值，但internalValue是数组
        // 这里我们只处理单个选择的事件，不处理整个数组的变化
        const originalData = getSelectClient(selectedValue)
        emit('select', selectedValue, originalData)
      } else {
        const originalData = getSelectClient(selectedValue)
        emit('select', selectedValue, originalData)
      }
    }

    // 监听外部value变化
    const internalValue = ref<ValueType>(props.value)
    watch(() => props.value, (newValue) => {
      internalValue.value = newValue
    }, { immediate: true })

    // 移除对internalValue的watch，避免重复触发
    // 直接在Select组件的change事件中处理
    const handleSelectChange = (newValue: ValueType): void => {
      internalValue.value = newValue
      handleValueChange(newValue)
    }

    onMounted(() => {
      fetchApplications()
    })

    return (): JSX.Element | string => {
      if (props.readonly) {
        return getDisplayLabel(props.value)
      }

      return (
        <Select
          options={options.value}
          placeholder="请选择应用端"
          value={internalValue.value}
          allowClear
          showSearch
          mode={props.multiple ? 'multiple' : undefined}
          onSelect={handleSelect}
          onChange={handleSelectChange}
          filterOption={(input: string, option: OptionItem | undefined) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      )
    }
  }
})
