import { cubeZhongdaHeshunService } from '@/api/service'
import type { Division } from '@ghcloud/cube-zhongda-heshun-service'
import { Cascader } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'
import type { DefaultOptionType, SelectValue } from 'ant-design-vue/es/select'

interface Props {
  readonly?: boolean;
  value?: string[];
  showAll?: boolean;
  options?: Division[];
}

export const DivisionTree = defineComponent({
  props: ['readonly', 'value', 'options', 'showAll'],
  emits: ['update:value', 'change'],
  setup (props: Props, { emit }) {
    const options = ref<Division[]>([])

    const fetchAllProjects = async (): Promise<void> => {
      try {
        const response = await cubeZhongdaHeshunService.getDivisionTree()
        options.value = response
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
    const onChange = (value: SelectValue, option: DefaultOptionType | DefaultOptionType[]): void => {
      emit('update:value', value)
      emit('change', value, option)
    }
    return (): JSX.Element | string => {
      if (props.readonly) {
        return value.value?.join('-') ?? '--'
      }
      return <Cascader
        options={options.value}
        placeholder='请选择行政区域'
        v-model:value={value.value}
        fieldNames={{ value: 'name', label: 'name', children: 'childrenList' }}
        onChange={onChange}
        allowClear
        showSearch
      />
    }
  }
})
