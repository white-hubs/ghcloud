import { schedulingRulePage } from '@/api/scheduling-manage'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch, type VNode } from 'vue'

interface Props {
  value: string | undefined;
  readonly?: boolean;
}
export const SchedulingRuleSelect = defineComponent({
  props: ['value', 'readonly'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const value = ref(props.value ?? undefined)
    const options = ref<{ label: string; value: string; }[]>([])
    const getData = async (): Promise<void> => {
      const res = await schedulingRulePage({ pageSize: 99999, pageNumber: 1 })
      const { records } = res.data
      options.value = records.map(e => {
        return {
          label: (e as { name: string; }).name, value: (e as { id: string; }).id
        }
      })
    }
    onMounted(() => {
      getData()
    })

    watch(() => value.value, () => {
      emit('update:value', value.value)
    })
    return (): string | VNode => !props.readonly
      ? (<Select v-model:value={value.value} options={options} disabled={props.readonly ?? false} getPopupContainer={() => document.querySelector('.attendance-layout-content')} /> as VNode)
      : options.value.find(e => e.value === props.value)?.label ?? '未查询到排版规则' as string
  }
})
