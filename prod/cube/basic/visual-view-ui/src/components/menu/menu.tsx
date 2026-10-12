import {NMenu,type MenuOption} from 'naive-ui'
import { defineComponent } from 'vue'

export const Menu = defineComponent({
  props: ['selectedKeys', 'openKeys',  'mode','options','accordion','children-field'],
  emits:['updateValue'],
  setup (props, { slots,emit }) {
    const handleSelect=(key: string, item: MenuOption)=>{
      emit('updateValue',item)
    }
    return () =>
      <NMenu
        {...props}
        v-model:selectedKeys={props.selectedKeys}
        v-model:openKeys={props.openKeys}
        onUpdate:value={handleSelect}
        mode={props.mode ?? 'vertical'}
      >{slots}
      </NMenu>
  }
})
