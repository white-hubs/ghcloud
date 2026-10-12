import { computed, defineComponent, ref, watch } from 'vue'
import { NTree as ATree, type TreeProps} from 'naive-ui'
import type {Key} from 'naive-ui/es/tree/src/interface.d'
export const Tree = defineComponent({
  emits:['change'],
  setup (props: TreeProps, { emit, slots }) {
    const slot = computed(() => {
      const res: Record<string, unknown> = {}
      slots.title && (res.title = ({ titleName }: { titleName: string; }) => slots.title?.(titleName))
      return res
    })
    const handleChange=(value:Key[])=>{
      emit('change',value)
    }
    return () =>
      <ATree
        {...props}
        style={{maxHeight:'200px'}}
        virtualScroll={props.virtualScroll}
        renderSuffix={props.renderSuffix}
        selectedKeys={props.selectedKeys}
        onUpdateSelectedKeys={handleChange}
        data={props.data}
      />
  }
})
