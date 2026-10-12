import { defineComponent, ref, watch } from 'vue'
import {NSelect} from 'naive-ui'
import './select.less'
import {SelectBaseOption, SelectInst, type SelectMixedOption,type Value} from 'naive-ui/es/select/src/interface'
import {type RenderLabel} from 'naive-ui/es/_internal/select-menu/src/interface'

interface Props {
  placeholder: string;
  multiple: string;
  options: SelectMixedOption[];
  clearable: boolean;
  disabled: boolean;
  show: boolean;
  showArrow: boolean;
  value: Value;
  renderLabel:RenderLabel;
}

export default defineComponent({
  emits: ['updateValue', 'clear', 'change','focus','blur','scroll'],
  props: ['placeholder', 'options', 'label-field','value-field','clearable','show','showArrow','multiple', 'value', 'disabled','renderLabel','size','renderOption' ],
  setup (props: Props, {slots,emit }) {
    const value = ref(props.value)
    const selectRef=ref<SelectInst | null>(null)
    watch(() => props.value, () => {
      value.value = props.value
    })
    watch(() => value.value, () => {
      selectRef.value?.blur()
    })
    const onClear = (): void => {
      emit('clear')
    }
    const onfocus=(): void => {
      emit('focus')
    }
    const onblur=(): void => {
      emit('blur')
    }
    const onscroll=(e:Event): void => {
      emit('scroll',e)
    }
    const UpdateValue=(value: Array | string | number | null, option: SelectBaseOption | null | SelectBaseOption[]) => {
      emit('updateValue',value,option)
    }
    const onchange=(value: Array | string | number | null, option: SelectBaseOption | null | SelectBaseOption[]): void => {
      emit('change',value,option)
    }
    return () => {
      return <NSelect  class='select'  ref={selectRef}  {...props} v-model:value={value.value} onClear={onClear} onFocus={onfocus} onBlur={onblur} onChange={onchange} onScroll={onscroll} onUpdate:value={UpdateValue}>{slots}</NSelect>
    }
  }
})
