import { getExamPaperPage } from '@/api/exam-paper'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch } from 'vue'

interface Props {
  value: string | undefined;
  readonly: boolean;
}

export const TextPaperSelectInput = defineComponent({
  props: ['value', 'readonly'],
  setup (props: Props, { emit }) {
    const options = ref<{ label: string; value: string; }[]>([])
    onMounted(async () => {
      const res = await getExamPaperPage({ pageNumber: 1, pageSize: 1000 })
      if (res.data) {
        options.value = res.data.records.map((e) => {
          const item = e as { id: string; name: string; }
          return { label: item.name, value: item.id }
        })
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
      return <Select options={options.value} placeholder='请选择' v-model:value={value.value} />
    }
  }
})
