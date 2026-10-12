import { defineComponent, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import Vue3DraggableResizable from 'vue3-draggable-resizable'
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { ComponentShape } from '@/views/editor-config/components/shape/component-shape'
import DynamicComponent from '@/components/common/dynamic-component'
import { getChartStyle, getSizeStyle } from '@/utils/style'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'combination',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const router = useRouter()
    const currentRoute = router.currentRoute
    // 转换后的普通组件
    let itemComponentList: CreateComponentType[] = []
    watch(() => chartEditStore.getCurrentBlock, () => {
      // 当前的组合组件
      const currentCombineList = ref<CreateComponentType[] | null>()
      // 获取所有组合组件
      const componentList = chartEditStore.getCurrentPageComponents.filter((block) => block.category === ComponentCategoryEnum.COMBINATION)
      componentList.length === 1
        ? currentCombineList.value = componentList[0].components
        : currentCombineList.value = componentList.find(block => block.id === props.item.id)?.components
      // 递归,将组合组件转换为普通组件
      const getItemComponentList = (list: CreateComponentType[]): CreateComponentType[] => {
        const compList: CreateComponentType[] = []
        const filterItem = (list: CreateComponentType[]): void => {
          for (const item of list) {
            // 普通组件,且不为普通组件的子项时直接渲染
            if (item.category !== ComponentCategoryEnum.COMBINATION && item.key !== 'menu-item' && item.key !== 'nav-item') {
              compList.push(item)
            }
            if (item.components)filterItem(item.components)
          }
        }
        filterItem(list)
        return compList
      }
      if (currentCombineList.value) itemComponentList = getItemComponentList(currentCombineList.value)
    }, { deep: true, immediate: true })
    return () => (
      <div style={{ ...props.style }}>
        {
          // 渲染普通组件
          itemComponentList.map((item: CreateComponentType) => {
            return (
              <Vue3DraggableResizable parent draggable={false} resizable={false} key={item.id} v-model:x={item.styles.x} v-model:y={item.styles.y}>
                <ComponentShape item={item}>
                  <DynamicComponent
                    component={item.key}
                    item={item}
                    style={currentRoute.value.name === 'editor-config'
                      ? { ...getSizeStyle(item.styles), display: item.styles.show ? 'block' : 'none' }
                      : { ...getChartStyle(item.styles) }}
                  />
                </ComponentShape>
              </Vue3DraggableResizable>
            )
          })
        }
      </div>
    )
  },
})
