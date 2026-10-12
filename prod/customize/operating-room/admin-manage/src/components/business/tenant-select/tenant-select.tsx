import { cubeOuaaService } from '@/api/service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, watch, type PropType } from 'vue'

/** 租户下拉选择 */
export const TenantSelect = defineComponent({
  props: {
    selectFirst: {
      type: Boolean,
      default: true
    },
    value: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: '180px'
    },
    placeholder: {
      type: String,
      default: '请选择所属医院'
    },
  },
  emits: ['update:value', 'change', 'select', 'firstLoad'],
  setup (props, { emit }) {
    const options = ref<{ label: string; value: string; }[]>([])
    const value = ref(props.value || undefined)
    const getTenants = async (): Promise<void> => {
      let list = []
      const { records } = await cubeOuaaService.getTenantsPage({ pageSize: 1000, pageNumber: 1, enabled: true })
      list = records.reverse()
      options.value = list.map(item => {
        return {
          label: item.name,
          value: item.code
        }
      })
      if (props.selectFirst && !props.value) {
        options.value[0] && (value.value = options.value[0].value)
        emit('firstLoad', value.value)
      }
      emit('update:value', value.value)
      const selectValue = options.value.find(ele => ele.value === value.value)
      if (selectValue) {
        emit('change', selectValue)
      }
    }
    watch(() => props.value, async (newValue) => {
      value.value = newValue
      await getTenants()
    }, { immediate: true })
    return (): JSX.Element =>
      <>
        <Select
          options={options.value}
          v-model:value={value.value}
          allowClear={props.allowClear ?? true}
          placeholder={props.placeholder}
          showSearch
          onChange={(e: string) => {
            emit('update:value', e)
            const selectValue = options.value.find(ele => e === ele.value)
            emit('change', selectValue)
          }}
          filterOption={
            (input: string, option: { label: string; }) => {
              return option.label.toLowerCase().includes(input.toLowerCase())
            }
          }
          style={{ width: props.width || '180px' }}
        />
      </>
  },
})
