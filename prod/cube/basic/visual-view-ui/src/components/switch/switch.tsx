import { defineComponent, ref, watch } from 'vue'
import { NSwitch  } from 'naive-ui'
interface Props {
  value: boolean;
}

export const Switch = defineComponent({
  emits: ['update:value', 'change'],
  props: ['value','disabled'],
  setup (props: Props, { emit }) {
    const value = ref(props.value ?? false)
    watch(() => props.value, () => {
      value.value = props.value ?? false
    })
    const onchange = (e:boolean): void => {
      emit('change',e)
      emit('update:value', value.value)
    }
    return () => <NSwitch v-model:value={value.value}  {...props} onUpdateValue={onchange} />
  }
})
