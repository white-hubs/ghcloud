import { Tag, TimePicker } from '@ghcloud/cube-ui'
import { defineComponent, ref, type VNode } from 'vue'
import dayjs from 'dayjs'

interface WorkTime {
  workTime: string;
  afterTime: string;
  beforeTime: string;
}
interface Props {
  value: WorkTime;
  showNextDay: boolean;
  firstText: string;
  readonly: boolean;
}

/** 打卡时间 */
export const ClockInTime = defineComponent({
  props: ['value', 'showNextDay', 'firstText', 'readonly'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const workTime = ref(props.value.workTime)
    const afterTime = ref(props.value.afterTime)
    const beforeTime = ref(props.value.beforeTime)

    const emitValue = (): void => {
      const res = {
        workTime: workTime.value,
        afterTime: afterTime.value,
        beforeTime: beforeTime.value
      }
      emit('update:value', res)
    }
    const workTimeChange = (): void => {
      if (workTime.value) {
        beforeTime.value = dayjs('2023-09-01 ' + workTime.value).subtract(3, 'hour').format('HH:mm')
        afterTime.value = dayjs('2023-09-01 ' + workTime.value).add(3, 'hour').format('HH:mm')
      } else {
        beforeTime.value = ''
        afterTime.value = ''
      }
      emitValue()
    }

    return (): VNode =>
      <>
        <div class='work-time-picker'>
          <TimePicker v-model:value={workTime.value} onUpdate:value={() => {
            workTimeChange()
          }} disabled={props.readonly ?? false} getPopupContainer={() => document.querySelector('.attendance-layout-content') ?? document.body} />
          {props.showNextDay && <Tag color='pink' class='next-day-tag'>次日</Tag>}
        </div>
        <div class='clock-in-time-range'>
          <span style='white-space:nowrap'>{props.firstText}</span>
          <div class='item'>
            <span class='label'>不早于</span>
            <TimePicker v-model:value={beforeTime.value} onUpdate:value={() => {
              emitValue()
            }} disabled={props.readonly ?? false} getPopupContainer={() => document.querySelector('.attendance-layout-content') ?? document.body} />
          </div>
          <div class='item'>
            <span class='label'>不晚于</span>
            <TimePicker v-model:value={afterTime.value} onUpdate:value={() => {
              emitValue()
            }} disabled={props.readonly ?? false} getPopupContainer={() => document.querySelector('.attendance-layout-content') ?? document.body} />
          </div>
        </div>
      </>
  }
})
