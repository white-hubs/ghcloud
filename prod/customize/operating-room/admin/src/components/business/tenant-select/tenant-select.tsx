import { cubeOuaaService } from '@/api/service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import { useCommonStore } from '@/hook/common-store.hook'
import type { TenantVo } from '@ghcloud/cube-ouaa-service'
/** 租户下拉选择 */
export const TenantSelect = defineComponent({
  props: {
    selectFirst: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ''
    },
    allowClear: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:value', 'change'],
  setup (props, { emit }) {
    const commonStore = useCommonStore()
    const options = ref<{ label: string; value: string; }[]>([])
    const value = ref(props.value)
    watch(() => props.value, () => {
      // 重置查询条件之后默认选中第一个
      if (props.value === '' && props.selectFirst && options.value.length > 0) {
        value.value = options.value[0].value
        emit('change', value.value)
      } else {
        value.value = props.value
      }
    })
    watch(() => value.value, () => {
      emit('update:value', value.value)
      emit('change', value.value)
    })

    onMounted(async () => {
      // let list = []
      // const { records } = await cubeOuaaService.getTenantsPage({ pageSize: 1000, pageNumber: 1, enabled: true })
      const list = await getList()
      options.value = list.map(item => {
        return {
          label: item.name,
          value: item.code
        }
      })
      if (props.selectFirst && props.value === '') {
        options.value[0] && (value.value = options.value[0].value)
        emit('update:value', value.value)
      }
    })
    const getList = async (): Promise<TenantVo[]> => {
      if (commonStore.tenantsOptions.length) {
        return commonStore.tenantsOptions
      }
      const { records } = await cubeOuaaService.getTenantsPage({ pageSize: 1000, pageNumber: 1, enabled: true })
      const list = records.reverse()
      commonStore.setTenantsOptions(list)
      return list
    }
    return (): JSX.Element =>
      <Select
        options={options.value}
        disabled={props.disabled}
        v-model:value={value.value}
        allowClear={props.allowClear ?? true}
        showSearch
        filterOption={
          (input: string, option: { label: string; }) => {
            return option.label.toLowerCase().includes(input.toLowerCase())
          }
        }
      />
  },
})
