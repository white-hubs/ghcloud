import { type PropType, defineComponent, ref, watch } from 'vue'
import { NRadio } from 'naive-ui'

interface Props {
  value?: string | number | boolean | undefined;
  checked?: boolean;
}

export default defineComponent({
  props: {
    value: {
      type: String as PropType<string | number | boolean | undefined>,
      default: ''
    },
    checked: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:checked'],
  setup (props: Props, { slots, emit }) { 
    const checked = ref(props.checked ?? false)
    const test = ref(false)
    watch(() => checked.value, () => {
      emit('update:checked', checked.value)
    })
    return () =>
      <NRadio value={props.value} v-model:checked={test.value}>{slots}</NRadio>
  }
})
