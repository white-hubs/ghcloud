
import { InputNumber } from '@ghcloud/cube-ui'
import { defineComponent, type PropType, reactive, watch } from 'vue'
import '@/styles/common.less'

export interface TimeLimitState {
  taskDay?: number | undefined;
  taskHour?: number | undefined;
  taskMinute?: number | undefined;
}
interface Props {
  value: string;
  timeData: TimeLimitState;
  isDetail: boolean;
}
export const InputTimeLimit = defineComponent({
  props: {
    value: {
      type: String,
      default: ''
    },
    timeData: {
      type: Object as PropType<TimeLimitState>,
      default: () => ({
        taskDay: 0,
        taskHour: 0,
        taskMinute: 0,
      })
    },
    isDetail: {
      type: Boolean,
      default: false
    },
  },
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const limitData = reactive<TimeLimitState>({
      taskDay: undefined,
      taskHour: undefined,
      taskMinute: undefined,
    })
    watch(() => props.value, () => {
      const timeLimit = props.value ? props.value.split(',') : []
      const info = {
        taskDay: timeLimit.length > 0 ? +(!Number.isNaN(timeLimit[0]) ? timeLimit[0] : 0) : 0,
        taskHour: timeLimit.length > 0 ? +(!Number.isNaN(timeLimit[1]) ? timeLimit[1] : 0) : 0,
        taskMinute: timeLimit.length > 0 ? +(!Number.isNaN(timeLimit[2]) ? timeLimit[2] : 0) : 0,
      }
      Object.assign(limitData, info)
    }, { immediate: true })
    watch(() => limitData, () => {
      const timeStr = `${!Number.isNaN(limitData.taskDay) ? limitData.taskDay : 0},${!Number.isNaN(limitData.taskHour) ? limitData.taskHour : 0},${!Number.isNaN(limitData.taskMinute) ? limitData.taskMinute : 0}`
      emit('update:value', timeStr)
    }, { deep: true })

    return (): JSX.Element => {
      if (props.isDetail) {
        const timeLimit = props.value ? props.value.split(',') : []
        const info = {
          taskDay: timeLimit.length > 0 ? +(!Number.isNaN(timeLimit[0]) ? timeLimit[0] : 0) : 0,
          taskHour: timeLimit.length > 0 ? +(!Number.isNaN(timeLimit[1]) ? timeLimit[1] : 0) : 0,
          taskMinute: timeLimit.length > 0 ? +(!Number.isNaN(timeLimit[2]) ? timeLimit[2] : 0) : 0,
        }
        return <span>{info.taskDay} 天 {info.taskHour} 时 {info.taskMinute} 分</span>
      }

      return (
        <div class='rate-item'>
          <InputNumber class='mr-10' min={0} max={360} v-model:value={limitData.taskDay} placeholder='请输入天' addon-after='天' />
          <InputNumber class='mr-10' min={0} max={24} v-model:value={limitData.taskHour} placeholder='请输入时' addon-after='时' />
          <InputNumber class='mr-10' min={0} max={60} v-model:value={limitData.taskMinute} placeholder='请输入分' addon-after='分' />
        </div>
      )
    }
  }
})
