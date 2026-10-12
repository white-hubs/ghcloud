import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { cubeDailyTaskService } from '../../../api/service'
import { getCurrentDailyType, type TaskCategoryModel } from '@ghcloud/cube-daily-task-service'

/** 任务紧急程度下拉框 */
interface Props {
  value: string;
  mode?: string;
  width?: string;
}
export const DailyTaskUrgencySelect = defineComponent({
  props: ['value', 'width', 'mode'],
  emits: ['update:value', 'change'],
  setup: (props: Props, { emit }) => {
    const options = ref<TaskCategoryModel[]>([])
    const getData = async (): Promise<void> => {
      cubeDailyTaskService.getUrgencyPage({
        pageSize: 1000,
        pageNumber: 1,
        dailyType: getCurrentDailyType(),
      }).then(res => {
        options.value = res?.records || []
        const selectValue = options.value.find(e => e.id === props.value)
        emit('change', props.value, selectValue)
      })
    }
    onMounted(async () => {
      await getData()
    })
    return (): JSX.Element =>
      <>
        <Select
          v-model:value={props.value}
          options={options.value}
          placeholder='请选择紧急程度'
          style={{ width: props.width ?? '100%' }}
          fieldNames={{ label: 'name', value: 'id' }}
          onUpdate:value={(value) => {
            emit('update:value', value)
          }}
          onChange={(value: unknown) => {
            emit('change', value, options.value.find(e => e.id === value))
          }}
          mode={props.mode ?? ''}
          allowClear
        />
      </>
  }
})
