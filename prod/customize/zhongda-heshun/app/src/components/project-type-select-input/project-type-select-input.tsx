import { cubeZhongdaHeshunService } from '@/api/service'
import type { DataTypeVO } from '@ghcloud/cube-zhongda-heshun-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'

interface Props {
  readonly?: boolean;
  value?: string;
  options?: { label: string; value: string; }[];
}

export const ProjectTypeSelectInput = defineComponent({
  props: ['readonly', 'value', 'options'],
  setup (props: Props, { emit }) {
    const options = ref<{ label: string; value: string; }[]>([])

    const fetchAllProjectTypes = async (): Promise<void> => {
      let allRecords: DataTypeVO[] = []
      let pageNumber = 1
      const pageSize = 20
      let hasMore = true

      try {
        while (hasMore) {
          const response = await cubeZhongdaHeshunService.getProjectTypeList({
            pageNumber,
            pageSize
          })

          allRecords = [...allRecords, ...response.records]

          // 判断是否还有更多数据
          if (response.records.length < pageSize) {
            hasMore = false
          } else {
            pageNumber++
          }
        }

        options.value = allRecords.map(item => ({
          label: item.dataName,
          value: item.id
        }))

      } catch (error) {
      }
    }

    onMounted(async () => {
      if (props.options) {
        options.value = props.options
      } else {
        fetchAllProjectTypes()
      }
    })
    const value = ref(props.value)
    watch(() => props.value, () => {
      value.value = props.value
    })
    watch(() => value.value, () => {
      emit('update:value', value.value)
    })

    return (): JSX.Element | string => {
      if (props.readonly) {
        return options.value.find(e => e.value === props.value)?.label ?? '--'
      }
      return <Select
        options={options.value}
        placeholder='请选择项目类型'
        v-model:value={value.value}
        allowClear
        showSearch
      />
    }
  }
})
