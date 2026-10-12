import dayjs from 'dayjs'
import { Popup, PickerGroup, DatePicker, TimePicker } from 'vant'
import { defineComponent, ref, watch } from 'vue'

interface Props {
  visible: boolean;
  value: string;
  format: string;
  title: string;
}

export const DataTimePicker = defineComponent({
  props: ['visible', 'value', 'format', 'title'],
  emits: ['update:visible', 'update:value'],
  setup: (props: Props, { emit }) => {
    const showPicker = ref(props.visible ?? false)
    const dateTime = ref<{
      date: string[];
      time: string[];
    }>({
      date: [],
      time: []
    })
    try {
      if (props.value) {
        dateTime.value.date = dayjs(props.value).format('YYYY-MM-DD').split('-')
        dateTime.value.time = dayjs(props.value).format('HH:mm').split('-')
      } else {
        dateTime.value.date = dayjs().format('YYYY-MM-DD').split('-')
        dateTime.value.time = dayjs().format('HH:mm').split(':')
      }
    } catch (error) {

    }
    watch(() => props.visible, (val) => {
      showPicker.value = val
    })
    const closePopup = (): void => {
      showPicker.value = false
      emit('update:visible', false)
    }
    const emitValue = (): void => {
      let res = ''
      try {
        res = dayjs(dateTime.value.date.join('-') + ' ' + dateTime.value.time.join(':')).format(props.format ?? 'YYYY-MM-DD HH:mm')
      } catch (error) {

      }
      emit('update:value', res)
    }
    return () =>
      <>
        <Popup v-model:show={showPicker.value} position='bottom'>
          <PickerGroup
            title={props.title}
            tabs={['选择日期', '选择时间']}
            next-step-text='下一步'
            onConfirm={() => { closePopup(); emitValue() }}
            onCancel={() => { closePopup() }}
          >
            <DatePicker v-model={dateTime.value.date} />
            <TimePicker v-model={dateTime.value.time} />
          </PickerGroup>
        </Popup>
      </>
  }
})
