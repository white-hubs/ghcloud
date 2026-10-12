import { defineComponent } from 'vue'
import { InputSearch as AinputSearch } from 'ant-design-vue/es'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface'

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
export  const InputSearch = defineComponent({
  emits: ['search','change'],
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
  setup (props: Props, { slots, emit }) {
    const onSearch = (value: string)=>{
      
      emit('search',value)
    }
    const onChenage = (value: ChangeEvent)=>{
      
      emit('change',value)
    }
    return () => <AinputSearch {...props} v-model:value={props.value} onChange={onChenage} onSearch={onSearch}/>
  }
})
