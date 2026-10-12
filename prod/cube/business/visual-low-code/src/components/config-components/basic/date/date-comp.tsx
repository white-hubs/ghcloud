import { defineComponent, nextTick, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { getComponentByType, getTime } from '@/utils'
import { type CreateComponentType, ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
export default defineComponent({
  name: 'image',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const dateComponent = ref<CreateComponentType | null>()
    const currentTime = ref('')
    watch(() => chartEditStore.active.pageId, () => {
      dateComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.DATE)
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        dateComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.DATE)
      })
    }, { immediate: true, deep: true })
    currentTime.value = getTime(dateComponent.value?.config.dateFormat)
    setInterval(() => {
      currentTime.value = getTime(dateComponent.value?.config.dateFormat)
    }, 1000)
    return () => (
      <div style={{ ...props.style, position: 'relative', fontSize: '16px' }}>
        {currentTime.value}
      </div>
    )
  },
})
