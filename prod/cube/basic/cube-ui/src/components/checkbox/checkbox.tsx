import { defineComponent, ref, watch } from 'vue'
import { Checkbox } from 'ant-design-vue/es'
interface Props {
  value?: unknown;
  checked?: boolean;
  disabled?: boolean;
}

export default defineComponent({
  props: {
    value: {
      type: Boolean,
      default: false
    },
    checked: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:checked'],
  setup (props: Props, { slots, emit }) {
    const checked = ref<boolean | undefined>(props.checked ?? false)
    watch(() => props.checked, () => {
      checked.value = props.checked
    })
    watch(() => checked.value, () => {
      emit('update:checked', checked.value)
    })

    return (): JSX.Element =>
      <Checkbox value={props.value} v-model:checked={checked.value} disabled={props.disabled ?? false}>{slots}</Checkbox>
  }
})
