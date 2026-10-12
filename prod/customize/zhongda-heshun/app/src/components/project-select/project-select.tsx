import { cubeZhongdaHeshunService } from '@/api/service'
import type { ProjectVO } from '@ghcloud/cube-zhongda-heshun-service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import type { DefaultOptionType, SelectValue } from 'ant-design-vue/es/select'

interface Props {
  readonly?: boolean;
  value?: string;
  showAll?: boolean;
  options?: { label: string; value: string | null; }[];
}

export const ProjectSelect = defineComponent({
  props: ['readonly', 'value', 'options', 'showAll'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const options = ref<{ label: string; value: string | null; }[]>([])

    const fetchAllProjects = async (): Promise<void> => {
      let allRecords: ProjectVO[] = []
      let pageNumber = 1
      const pageSize = 20
      let hasMore = true

      try {
        while (hasMore) {
          const response = await cubeZhongdaHeshunService.getProjectPageList({
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
          label: item.projectName,
          value: item.id,
          beginTime: item.beginTime,
          endTime: item.endTime,
        }))
        if (props.showAll)
          options.value.unshift({
            label: '全部',
            value: null
          })
      } catch (error) {
      }
    }

    onMounted(async () => {
      if (props.options) {
        options.value = props.options
      } else {
        fetchAllProjects()
      }
    })
    const value = ref(props.value)
    watch(() => props.value, () => {
      value.value = props.value
    })
    // watch(() => value.value, () => {
    //   emit('update:value', value.value)
    //   emit('change', value.value)
    // })
    const onChange = (value: SelectValue, option: DefaultOptionType | DefaultOptionType[]): void => {
      emit('update:value', value)
      emit('change', value, option)
    }
    return (): JSX.Element | string => {
      if (props.readonly) {
        return options.value.find(e => e.value === props.value)?.label ?? '--'
      }
      return <Select
        options={options.value}
        placeholder='请选择项目'
        v-model:value={value.value}
        onChange={onChange}
        allowClear
        showSearch
      />
    }
  }
})
