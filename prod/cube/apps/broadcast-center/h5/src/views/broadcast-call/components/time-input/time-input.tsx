import dayjs from 'dayjs'
import { Field, Popup, TimePicker } from 'vant'
import { defineComponent, ref, watch } from 'vue'

interface Props {
  label: string;
  placeholder: string;
  required?: boolean;
  value: string;
}
export const TimeInput = defineComponent({
  props: ['label', 'placeholder', 'required', 'value'],
  emits: ['update:value'],
  setup: (props: Props, { emit }) => {
    const dateSelect = ref<string[]>([])
    const fieldValue = ref('')
    const showPicker = ref(false)

    watch(() => props.value, () => {
      if (props.value) {
        dateSelect.value = dayjs(props.value).format('HH:mm').split(':')
      } else {
        dateSelect.value = dayjs().format('HH:mm').split(':')
      }
    }, { immediate: true })

    const closePopup = (): void => {
      showPicker.value = false
    }

    const emitValue = (): void => {
      fieldValue.value = dateSelect.value.join(':')
      emit('update:value', dateSelect.value.join(':'))
    }

    return (): JSX.Element =>
      <>
        <Field
          label={props.label}
          placeholder={props.placeholder ?? ''}
          modelValue={fieldValue.value}
          is-link
          readonly
          onClick={() => {
            showPicker.value = true
          }}
          rules={[{ required: props.required, message: props.placeholder ?? '请选择' }]}
        />
        <Popup v-model:show={showPicker.value} position='bottom'>
          <TimePicker
            title={props.label}
            v-model={dateSelect.value}
            onConfirm={() => {
              closePopup(); emitValue()
            }}
            onCancel={() => {
              closePopup()
            }}
          />
        </Popup>
      </>
  }
})
