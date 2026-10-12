import { defineComponent, ref, watch } from 'vue'
import { UserPickerInput } from '@ghcloud/generic-component'
import { Checkbox, Input } from '@ghcloud/cube-ui'

interface Props {
  value: string;
  readonly: boolean;
}

export const SpeakerSelectInput = defineComponent({
  props: ['value', 'readonly'],
  emits: ['update:value'],
  setup (props: Props, { emit }) {
    const userPickerInputRef = ref<{ openModal: () => void; }>()
    const value = ref(props.value ?? '')
    const checked = ref(false)
    const openModal = (): void => {
      userPickerInputRef.value?.openModal()
    }
    const users = ref<{ name: string; }[]>([])
    watch(() => users.value, () => {
      if (users.value.length) {
        value.value = users.value[0].name ?? ''
        emit('update:value', value.value)
      }
    }, { deep: true })

    const inputChange = (): void => {
      emit('update:value', value.value)
    }

    return (): JSX.Element | string => {
      const body = (
        <>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, marginRight: '10px' }}>
              <Input v-model:value={value.value} showCount={false} placeholder={!checked.value ? '请选择' : '请输入'} allowClear={checked.value} onChange={inputChange} />
              {
                !checked.value && <div style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1, top: 0, cursor: 'pointer' }} onClick={openModal} />
              }

            </div>
            <Checkbox v-model:checked={checked.value}>输入</Checkbox>
          </div>
          <div style={{ display: 'none' }}>
            <UserPickerInput ref={userPickerInputRef} style={{ display: 'none' }} v-model:value={users.value} />
          </div>
        </>
      )

      return !props.readonly ? body : props.value
    }
  }
})
