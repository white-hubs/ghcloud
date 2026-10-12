import { getTrainingTaskPage } from '@/api/training-task'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'

interface Props {
  value?: string;
  themeId?: string;
}

/** 培训任务选择 */
export const TrainingTaskSelectInput = defineComponent({
  props: ['value', 'themeId'],
  setup (props: Props, { emit }) {
    const options = ref<{ label: string; value: string; }[]>([])
    const getOptions = async (): Promise<void> => {
      const res = await getTrainingTaskPage({ pageNumber: 1, pageSize: 1000, themeId: props.themeId })
      if (res.data) {
        options.value = res.data.records.map((e) => {
          const item = e as { id: string; name: string; }
          return { label: item.name, value: item.id }
        })
      }
    }
    onMounted(async () => {
      getOptions()
    })
    const value = ref(props.value)
    watch(() => props.value, () => {
      value.value = props.value
    })
    watch(() => value.value, () => {
      emit('update:value', value.value)
    })
    watch(() => props.themeId, () => {
      value.value = undefined
      getOptions()
    })

    return (): JSX.Element => {
      return <Select options={options.value} placeholder='请选择' v-model:value={value.value} allowClear />
    }
  }
})
