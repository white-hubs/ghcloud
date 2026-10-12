import { defineComponent } from 'vue'
import { NTreeSelect } from 'naive-ui'
import { TreeSelectOption } from 'naive-ui'
export const TreeSelect = defineComponent({
  emits:['UpdateValue'],
  props: ['options','multiple','cascade','checkable','max-tag-count','UpdateValue','children-field','label-field','key-field','default-value','value','placeholder','check-strategy','loading'],
  setup (props,{emit}) {
    const UpdateValue=(value: string | number | Array<string | number> | null,option: TreeSelectOption | null | Array<TreeSelectOption | null>)=>{
      emit('UpdateValue',{value,option})
    }
    return () => <NTreeSelect {...props} value={props.value}  onUpdate:value={UpdateValue} />
  }
})
