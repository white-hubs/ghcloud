import { attendanceGroupList } from '@/api/attendance-group'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref, watch, type VNode } from 'vue'

interface Props {
  value: string | undefined;
}
export const AttendanceGroupSelect = defineComponent({
  props: ['value'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const value = ref(props.value ?? undefined)
    const options = ref<{ label: string; value: string; }[]>([])
    const getData = async (): Promise<void> => {
      const res = await attendanceGroupList()
      options.value = res.data.map(e => {
        return { label: e.name, value: e.id }
      })
    }
    onMounted(() => {
      getData()
    })

    watch(() => value.value, () => {
      emit('update:value', value.value)
    })
    watch(() => props.value, () => {
      value.value = props.value ?? undefined
    })
    return (): VNode => <Select v-model:value={value.value} options={options} allowClear />
  }
})
