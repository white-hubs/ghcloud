import { cubeZhongdaHeshunService } from '@/api/service'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'

interface Props {
  readonly?: boolean;
  value?: string;
  options?: { label: string; value: string; }[];
}
interface Place {
  id: string;
  dataName: string;
  count: number;
}
export const ProjectPlaceTypeSelect = defineComponent({
  props: ['readonly', 'value', 'options'],
  setup (props: Props, { emit }) {
    const options = ref<{ label: string; value: string; }[]>([])

    const fetchAllProjectPlaceTypes = async (): Promise<void> => {
      try {
        const response = await cubeZhongdaHeshunService.getTypeAllList({ dataType: 'PLACE' }) as Place[]
        options.value = response.map(item => ({
          label: item.dataName,
          value: item.id
        }))
      } catch {}
    }

    onMounted(async () => {
      if (props.options) {
        options.value = props.options
      } else {
        fetchAllProjectPlaceTypes()
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
        placeholder='请选择项目场所类型'
        v-model:value={value.value}
        allowClear
        showSearch
      />
    }
  }
})
