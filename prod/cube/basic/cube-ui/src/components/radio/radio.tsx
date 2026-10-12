import { type PropType, defineComponent, ref, watch } from 'vue'
import { Radio } from 'ant-design-vue/es'
interface Props {
  value?: unknown;
  checked?: boolean;
}

export default defineComponent({
  props: {
    value: {
      type: String as PropType<unknown>,
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
    return (): JSX.Element=>
      <Radio value={props.value} v-model:checked={test.value}>{slots}</Radio>
  }
})
