import { Select } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { cubeDailyTaskService } from '../../../api/service'
import { getCurrentDailyType, type TaskCategoryModel } from '@ghcloud/cube-daily-task-service'

/** 任务周期下拉框 */
interface Props {
  value: string;
  mode?: string;
  width?: string;
}
export const DailyTaskCycleSelect = defineComponent({
  props: ['value', 'width', 'mode'],
  emits: ['update:value', 'change'],
  setup: (props: Props, { emit }) => {
    const options = ref<TaskCategoryModel[]>([])
    const getData = async (): Promise<void> => {
      cubeDailyTaskService.getTaskCyclePage({
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
          placeholder='请选择任务周期'
          style={{ width: props.width ?? '200px' }}
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
