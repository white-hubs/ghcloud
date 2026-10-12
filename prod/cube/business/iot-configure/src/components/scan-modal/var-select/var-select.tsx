import { fetchScanResultDeduplicate } from '@/api/scan'
import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'

interface Props {
  value: string[];
  width: string;
  taskId: string;
}
/** 变量选择器 */
export const VarSelect = defineComponent({
  props: ['value', 'width', 'taskId'],
  emits: ['update:value', 'change'],
  setup: (props: Props, { emit }) => {
    const options = ref<unknown[]>([])

    onMounted(async () => {
      const { data } = await fetchScanResultDeduplicate({
        taskId: props.taskId,
      })
      options.value = data?.pairs as unknown as unknown[]
    })

    return (): JSX.Element =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择变量'
          field-names={{ label: 'varName', value: 'varCode' }} style={{ width: props.width || '240px' }}
          onChange={(e: string) => {
            emit('update:value', e)
            const selectValue = options.value.find(ele => e === ele.varCode)
            emit('change', selectValue)
          }}
          allowClear
          showSearch
          optionFilterProp='varName'
          mode='multiple'
          maxTagCount={1}
        />
      </>
  }
})
