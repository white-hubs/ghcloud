import { defineComponent, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import CheckboxGroup from '@ghcloud/cube-ui/src/components/checkbox-group/checkbox-group'
export default defineComponent({
  name: 'page-title',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const notToolComponent = ref<CreateComponentType | null>()
    const checkedSwitch = ref<string[]>([])
    const notOption = [{ label: '全屏切换', value: 'screenSwitch' }, { label: '菜单隐藏显示', value: 'menuSwitch' }, { label: '通知', value: 'notiSwitch' }]
    watch(() => chartEditStore.active.pageId, () => {
      notToolComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.NOTIFICATIONTOOL)
      checkedSwitch.value = notToolComponent.value?.config.checkedSwitch
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      notToolComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.NOTIFICATIONTOOL)
      checkedSwitch.value = notToolComponent.value?.config.checkedSwitch
    }, { immediate: true, deep: true })
    const handleFormat = (val: string[]): void => {
      checkedSwitch.value = val
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.checkedSwitch = val
      if (notToolComponent.value)chartEditStore.sycShareData(notToolComponent.value)
    }
    return () => (
      <div style={{ margin: '10px', display: 'flex', justifyContent: 'space-evenly', alignItems: 'baseline' }}>
        <div>展示内容</div>
        <CheckboxGroup options={notOption} v-model:value={checkedSwitch.value} vertical onChange={handleFormat} />
      </div>
    )
  },
})
