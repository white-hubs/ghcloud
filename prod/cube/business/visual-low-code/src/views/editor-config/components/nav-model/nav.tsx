import { computed, defineComponent } from 'vue'
import { Trash, Icon, Tree, Eye, EyeOff, ToolTip, useMessage, useDialog } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { useChartHistoryStore } from '@/store/modules/chart-history-store/chart-history-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import './index.less'
import _ from 'lodash'
import { HistoryActionTypeEnum } from '@/store/modules/chart-history-store/chart-history-store.d'
export default defineComponent({
  name: 'Nav',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const chartHistoryStore = useChartHistoryStore()
    const message = useMessage()
    const dialog = useDialog()
    // const selectKey = ref<string[] | number[]>([])
    const navTreeData = computed(() => {
      if (!chartEditStore.getCurrentPageComponents) return []
      return handleTreeChildren(chartEditStore.getCurrentPageComponents)
    })
    const selectKeys = computed(() => {
      return chartEditStore.getActive.targetId
    })
    const handleTreeChildren = (arr: CreateComponentType[]): CreateComponentType[] => {
      if (arr.length) {
        for (const item of arr) {
          if (item.components) {
            if (item.components.length) {
              handleTreeChildren(item.components)
            } else {
              item.components = null
            }
          }
        }
      }
      return arr
    }
    const handleDeleteComponent = (option: CreateComponentType): void => {
      // 过滤删除数据
      function filterTree (data: CreateComponentType[], id: string): CreateComponentType[] {
        const newTree = data.filter(x => x.id !== id)
        newTree.forEach(x => x.components && (x.components = filterTree(x.components, id)))
        return newTree
      }
      dialog.warning({
        title: '提示',
        content: `你是否确定删除${option.categoryName === '模型' ? '模型' : '组件'}【${option.title}】？`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          if (option.categoryName === '模型') {
            chartEditStore.setCurrentPageModel(null)
            chartEditStore.setModelNav([])
          } else {
            let pageComponents = _.cloneDeep(chartEditStore.getCurrentPageComponents)
            pageComponents = filterTree(pageComponents, option.id)
            chartEditStore.setCurrentPageComponents(pageComponents)
            chartEditStore.setTargetComp([])
            chartEditStore.delShareData(option)
            chartHistoryStore.createStackItem(option, HistoryActionTypeEnum.DELETE, '')
          }
          message.success('删除成功')
        }
      })
    }
    const handleVisibleComponent = (option: CreateComponentType): void => {
      option.styles.show = !option.styles.show
      chartEditStore.setTargetComp(option.id)
      message.success('操作成功')
    }
    const renderSuffix = ({ option }: { option: CreateComponentType; }): unknown => {
      // 显示隐藏icon插槽
      const { show } = option.styles
      const visibleSlots = {
        trigger: () => (
          <span class='visible' onClick={() => { handleVisibleComponent(option) }}>
            <Icon>
              {show ? <Eye /> : <EyeOff />}
            </Icon>
          </span>)
      }
      const visibleText = !show ? '显示' : '隐藏'
      // 删除icon
      const deleteSlots = {
        trigger: () => (
          <span class='delete' onClick={() => { handleDeleteComponent(option) }}>
            <Icon>
              <Trash />
            </Icon>
          </span>
        )
      }
      return (
        <div style={{ width: '40px' }}>
          {option.categoryName !== '模型' &&
            <ToolTip v-slots={visibleSlots}>
              {visibleText}
            </ToolTip>}

          <ToolTip v-slots={deleteSlots}>
            删除
          </ToolTip>
        </div>
      )
    }
    const handleSelectChange = (val: string[]): void => {
      chartEditStore.setTargetComp(val)
    }
    const modelData = computed(() => {
      if (!chartEditStore.getCurrentPage?.model) return []
      return [chartEditStore.getCurrentPage.model]
    })
    return () => {
      return (
        <>
          <div class='nav-box'>
            {modelData.value.length ? <Tree data={modelData.value} label-field='title' key-field='id' block-line children-field='components' selectable selectedKeys={selectKeys.value} renderSuffix={renderSuffix} onChange={handleSelectChange} /> : ''}
            <Tree data={navTreeData.value} label-field='title' key-field='id' block-line children-field='components' selectable selectedKeys={selectKeys.value} renderSuffix={renderSuffix} onChange={handleSelectChange} />
          </div>
        </>
      )
    }
  },
})
