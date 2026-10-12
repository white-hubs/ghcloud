import { defineComponent, watch, ref, nextTick } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { Menu } from '@ghcloud/visual-view-ui'
import styles from './menu-bar.module.less'
import { getComponentByType } from '@/utils'
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
export default defineComponent({
  name: 'menu-bar',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const activeId = ref<string>('')
    const onclick = (val: CreateComponentType): void => {
      const currentShareData = chartEditStore.shareData.find(share => share.id === props.item.id || share.id === props.item.attr.sourceShareDataId)
      if (currentShareData) {
        currentShareData.currentItemId = val.id
      }
      if (!(val.interactive?.[0])) return
      if (!(val.interactive?.[0].target)) return
      // 跳转页面
      chartEditStore.setActivePage(val.interactive[0].target)
    }
    // 当前的菜单项
    const menuOption = ref<CreateComponentType[] | null>()
    watch(() => chartEditStore.active.pageId, () => {
      menuOption.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.MENU_BAR)?.components ?? []
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        menuOption.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.MENU_BAR)?.components ?? []
      })
    }, { immediate: true, deep: true })
    watch(() => activeId.value, () => {
      if (props.item.attr.isShareData) {
        const currentShareData = chartEditStore.shareData.find(share => share.id === props.item.id || share.id === props.item.attr.sourceShareDataId)
        if (currentShareData) {
          activeId.value = currentShareData.currentItemId
        }
      }
    }, { immediate: true })
    return () => (
      <div style={{ ...props.style, position: 'relative' }}>
        <Menu class={styles.menu} style={{ ...props.style }} v-model:value={activeId.value} onUpdateValue={onclick} children-field='components' accordion mode='horizontal' label-field='title' key-field='id' options={menuOption.value} />
      </div>
    )
  },
})
