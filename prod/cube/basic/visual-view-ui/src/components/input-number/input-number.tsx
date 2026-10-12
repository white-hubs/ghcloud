import { defineComponent } from 'vue'
import { NInputNumber } from 'naive-ui';
import './input-number.less'

interface Props {
  name?: string;
  placeholder?: string;
  size?: number;
  disabled?: boolean;
  readonly?: boolean;
  allowClear?: boolean;
  maxlength?: number;
  showCount?: boolean;
  bordered?: boolean;
  value?: number;
}

export default defineComponent({
  emits:['change'],
  props: {
    placeholder: {
      type: String,
      default: '请输入数字',
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 999999999999999
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    step: {
      type: Number,
      default: 1
    },
  },
  setup (props: Props, { slots,emit }) {
    const onchange=(val:number | null)=>{
      emit('change',val)
    }
    return () => <NInputNumber {...props} class='cube-input-number' v-model={props.value} onChange={onchange}>{slots}</NInputNumber>
  }
})
