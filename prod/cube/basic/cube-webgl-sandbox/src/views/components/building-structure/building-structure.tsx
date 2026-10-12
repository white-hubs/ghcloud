import { Tree } from '@ghcloud/cube-ui'
import { cubeWeb3DInstance } from '@ghcloud/cube-visual-sdk'
import { defineComponent, ref } from 'vue'

interface NodeTree {
  id: string;
  name: string;
  type: string;
  children?: NodeTree[];
}

export const BuildingStructure = defineComponent({
  name: 'BuildingStructure',
  setup () {
    const treeData = ref<NodeTree[]>([])
    const checkedKeys = ref<string[]>([])
    const getNodeTree = (): void => {
      const tree = cubeWeb3DInstance.getNodeTree()
      tree.children?.length && (treeData.value = tree.children)
      // checkedKeys 勾选所有
      checkedKeys.value = treeData.value.map(item => item.id)
    }
    return (): JSX.Element => (
      <div class="funcPane" style="display: block;">
        <div class="px-1">
          <button id="generateBimTreeBtn" type="button" class="btn btn-sm btn-success" onClick={getNodeTree}>生成目录树</button>
        </div>
        <div class="py-3">
          <Tree
            checkable
            tree-data={treeData.value}
            fieldNames={{ children: 'children', title: 'name', key: 'id' }}
            v-model:checkedKeys={checkedKeys.value}
            onCheck={(checkedKeys: string[], { checked, node }: { checked: boolean; node: { id: string; }; }) => {
              cubeWeb3DInstance.setNodeEnableById(node.id, checked)
            }}
          ></Tree>
        </div>
      </div>
    )
  }
})