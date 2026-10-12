import { defineComponent, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import Select from '@ghcloud/visual-view-ui/src/components/select/select'
export default defineComponent({
  name: 'page-title',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const dateComponent = ref<CreateComponentType | null>()
    const dateFormat = ref('')
    const dateOption = [
      { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
      { label: 'YYYY-MM-DD hh:mm', value: 'YYYY-MM-DD hh:mm' },
      { label: 'YYYY-MM-DD hh:mm:ss', value: 'YYYY-MM-DD hh:mm:ss' },
      { label: 'MM-DD hh:mm:ss', value: 'MM-DD hh:mm:ss' },
      { label: 'MM-DD hh:mm', value: 'MM-DD hh:mm' }]
    watch(() => chartEditStore.active.pageId, () => {
      dateComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.DATE)
      dateFormat.value = dateComponent.value?.config.dateFormat
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      dateComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.DATE)
      dateFormat.value = dateComponent.value?.config.dateFormat
    }, { immediate: true, deep: true })
    const handleFormat = (val: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.dateFormat = val
      if (dateComponent.value)chartEditStore.sycShareData(dateComponent.value)
    }
    return () => (
      <div style={{ margin: '10px', display: 'flex' }}>
        <div style={{ width: '80px', lineHeight: '38px' }}>展示内容</div><Select v-model:value={dateFormat.value} options={dateOption} onUpdateValue={handleFormat} />
      </div>
    )
  },
})
