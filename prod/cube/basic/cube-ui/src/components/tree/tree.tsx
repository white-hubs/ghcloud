import { defineComponent, ref, watch } from 'vue'
import { Tree as ATree, type TreeProps } from 'ant-design-vue/es'

import type { TreeDataItem } from 'ant-design-vue/lib/tree/Tree'
import type { Key } from 'ant-design-vue/es/vc-tree/interface'
import type { EventDataNode } from 'ant-design-vue/lib/vc-tree/interface'

export declare type TreeDataItemNode = TreeDataItem

export const Tree = defineComponent({
  emits: ['check', 'select', 'update:expandedKeys'],
  setup (props: TreeProps, { emit, slots }) {
    const onCheck = (checkedKeys: Key[] | { checked: Key[]; halfChecked: Key[]; }, e: { checked: boolean; checkedNodes: TreeDataItem[]; node: EventDataNode; event: string; }): void => {
      emit('check', checkedKeys, e)
    }
    const onSelect = (selectedKeys: Key[] | { checked: Key[]; halfChecked: Key[]; }, e: { selected: boolean; selectedNodes: TreeDataItem[]; node: EventDataNode; event: string; }): void => {
      emit('select', selectedKeys, e)
    }
    const value = ref(props.checkedKeys)
    watch(() => props.checkedKeys, () => {
      value.value = props.checkedKeys
    })
    const expandedKeys = ref(props.expandedKeys ?? ['0-0'])
    return (): JSX.Element=>
      <ATree
        {...props}
        v-slots={slots}
        blockNode
        v-model:expandedKeys={expandedKeys.value}
        v-model:selectedKeys={props.selectedKeys}
        v-model:checkedKeys={props.checkedKeys}
        autoExpandParent
        onCheck={onCheck}
        onSelect={onSelect}
        onExpand={(e) => {
          emit('update:expandedKeys', e)
          expandedKeys.value = e
        }}
      />
  }
})
