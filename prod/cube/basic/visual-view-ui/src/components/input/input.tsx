import { defineComponent,PropType,watch,ref} from 'vue'
// import { Input, type InputProps } from 'ant-design-vue/es'
import { NInput, type InputProps } from 'naive-ui';
// import 'ant-design-vue/es/input/style'
// import type { ChangeEvent } from 'ant-design-vue/es/_util/EventInterface'

export default defineComponent({
  emits: ['inputFocus', 'change', 'input','update:value'],
  props: {
    value:{
      type:String as PropType<string | [string, string] | null>,
      default:''
    },
    placeholder: {
      type: String,
      default: '请输入',
    },
    maxlength: {
      type: Number,
      default: undefined
    },
    showCount: {
      type: Boolean,
      default: false
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    type: {
      type: String as PropType<"textarea" | "text" | "password">,
      default: 'text'
    }
  },
  setup (props, { emit,slots }) {
    const selectValue=ref(props.value)
    watch(() => props.value,()=>{
      selectValue.value=props.value
    })
    watch(()=>selectValue.value,()=>{
      emit('update:value', selectValue.value)
    })
    const onFocus = (): void => {
      emit('inputFocus')
    }
    const onchange = (v: string): void => {
      emit('change', v)
    }
    const oninput = (v: string): void => {
      emit('input', v)
    }
    return () => <NInput {...props} v-model:value={selectValue.value} onFocus={onFocus} type={props.type} onInput={oninput} onChange={onchange}>{slots}</NInput>
  }
})
