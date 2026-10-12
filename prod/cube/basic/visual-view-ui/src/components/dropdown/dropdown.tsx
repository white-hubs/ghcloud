import { defineComponent } from 'vue'
import { DropdownOption, NDropdown } from 'naive-ui'

export const DropDown = defineComponent({
  props: ['key-field', 'label-field','size','options','trigger','icon','render-icon','render','node-props','menu-props'],
  emits:['select'],
  setup (props, { slots,emit }) {
    const onselect=(key: string | number, option: DropdownOption):void=>{
      emit('select',{key,option})
    }
    return () => <NDropdown {...props} trigger={props.trigger ?? 'hover'} onSelect={onselect} ><div>{slots.default?.()}</div></NDropdown>
  }
})
