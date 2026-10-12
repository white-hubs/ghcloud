import { defineComponent, nextTick, ref, watch } from 'vue'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import styles from './title.module.less'
const titleBg = "/resource/v1/visual-low-code/images/exception/title.png"
import { type CreateComponentType, ComponentCategoryEnum } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'Title',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const titleComponent = ref<CreateComponentType | null>()
    watch(() => chartEditStore.active.pageId, () => {
      titleComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.TITLE)
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.getCurrentBlock, () => {
      nextTick(() => {
        titleComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, ComponentCategoryEnum.TITLE)
      })
    }, { immediate: true, deep: true })
    return () => (
      <div style={{ ...props.style, position: 'relative' }}>
        <div style={{ width: props.style.width, height: props.style.height, margin: '0 auto', textAlign: 'center', backgroundImage: `url(${titleBg})`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat' }}>
          <p class={styles['title-content']}>{titleComponent.value?.title}</p>
        </div>
      </div>
    )
  },
})
