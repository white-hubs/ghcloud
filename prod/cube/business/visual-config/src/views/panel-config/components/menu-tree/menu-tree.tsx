import type { GetSceneMenu } from '@ghcloud/cube-mdata-service'
import { Empty, Spin, Tree } from '@ghcloud/cube-ui'
import { defineComponent, onMounted, ref } from 'vue'
import { defaultFileds, type SelectType } from '../../panel-config-i'
import { getScenePage } from '@/api/mdata'
import { useUtils } from '@/hooks/use-utils'

export const MenuTree = defineComponent({
  emits: ['select'],
  setup (props, { emit }) {
    const { getProjectId } = useUtils()
    const projectId = getProjectId()
    const treeLoading = ref(false)
    const treeData = ref<GetSceneMenu[]>([])
    onMounted(async () => {
      try {
        treeLoading.value = true
        treeData.value = await getScenePage({ projectId })
      } catch {

      } finally {
        treeLoading.value = false
      }
    })
    const selectNode = (selectedKeys: string[], e: SelectType): void => {
      emit('select', e.node.id)
    }
    return (): JSX.Element => <Spin tip='加载中...' spinning={treeLoading.value}>
      {
        treeData.value.length
          ? <Tree
            tree-data={treeData.value}
            defaultExpandAll
            fieldNames={defaultFileds}
            onSelect={selectNode}
          />
          : <Empty />
      }
    </Spin>
  }
})
