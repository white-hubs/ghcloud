import { defineComponent, type Slot } from 'vue'
import { InputSearch as AInputSearch } from 'ant-design-vue/es'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import type { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface'

interface Props {
  name?: string;
  placeholder?: string;
  size?: SizeType;
  disabled?: boolean;
  readonly?: boolean;
  allowClear?: boolean;
  showCount?: boolean;
  bordered?: boolean;
  value?: number;
}
export const InputSearch = defineComponent({
  emits: ['search', 'change'],
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    allowClear: {
      type: Boolean,
      default: true
    }
  },
  setup (props: Props, { emit, slots }) {
    const onSearch = (value: string): void => {
      emit('search', value)
    }
    const onChange = (value: ChangeEvent): void => {
      emit('change', value)
    }
    const vSlots: Record<string, Slot> = {

    }
    if (slots.enterButton){
      // @ts-ignore
      vSlots.enterButton = ()=> slots.enterButton()
    }
    return (): JSX.Element => <AInputSearch {...props} v-model:value={props.value} onChange={onChange} onSearch={onSearch} v-slots={vSlots} />
  }
})
