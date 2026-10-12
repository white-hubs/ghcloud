import { cbeDeviceCenterInternalService } from '../../api/service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, ref, reactive, onMounted } from 'vue'

interface Props {
  multiple: boolean;
  value: string | string[];
  placeholder: string;
  readonly: boolean;
}

/** 设备选择器 */
export const EquipmentSelect = defineComponent({
  props: ['value', 'multiple', 'placeholder', 'readonly'],
  emits: ['update:value'],
  setup: (props: Props, { emit, attrs }) => {
    const options = ref<{ label: string; value: string; }[]>([])
    const pagination = reactive({
      pageNumber: 1,
      pageSize: 20,
      total: 0,
      loading: false,
      finished: false,
      keyword: ''
    })

    const loadData = async (init = false): Promise<void> => {
      if (init) {
        pagination.pageNumber = 1
        pagination.finished = false
      }
      if (!init && (pagination.loading || pagination.finished)) return

      pagination.loading = true
      try {
        const res = await cbeDeviceCenterInternalService.getDevicePage({
          pageNumber: pagination.pageNumber,
          pageSize: pagination.pageSize,
          deviceNameOrNumber: pagination.keyword
        })
        const records = (res.records || []) as { id: string; name: string; }[]
        const newOptions = records.map((e) => ({
          value: e.id ?? '',
          label: e.name ?? '未知'
        }))

        if (init) {
          options.value = newOptions
        } else {
          options.value = [...options.value, ...newOptions]
        }

        pagination.total = res.total || 0
        if (options.value.length >= pagination.total) {
          pagination.finished = true
        } else {
          pagination.pageNumber++
        }
      } catch {
        // ignore
      } finally {
        pagination.loading = false
      }
    }

    const onSearch = (val: string): void => {
      pagination.keyword = val
      loadData(true)
    }

    const onPopupScroll = (e: Event): void => {
      const target = e.target as HTMLElement
      if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10) {
        loadData()
      }
    }

    onMounted(() => {
      loadData(true)
    })

    return (): JSX.Element=>
      <>
        <Select
          {...attrs}
          value={props.value}
          options={options.value}
          placeholder={props.placeholder ?? '请选择设备'}
          mode={props.multiple ? 'multiple' : undefined}
          onChange={(e: string) => {
            emit('update:value', e)
          }}
          allowClear
          showSearch
          disabled={props.readonly}
          optionFilterProp='label'
          onSearch={onSearch}
          onPopupScroll={onPopupScroll}
          filterOption={false}
        />
      </>
  }
})
