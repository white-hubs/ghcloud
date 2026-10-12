import { defineComponent, ref, watch } from 'vue'
import { Form, Input, FormItem } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { getComponentByType } from '@/utils'
import { ComponentCategoryEnum, type CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'

export default defineComponent({
  name: 'page-title',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const titleName = ref('')
    const titleComponent = ref<CreateComponentType | null>()
    watch(() => chartEditStore.active.pageId, () => {
      titleComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.TITLE)
      titleName.value = titleComponent?.value?.title ?? ''
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      titleComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, ComponentCategoryEnum.TITLE)
      titleName.value = titleComponent?.value?.title ?? ''
    }, { immediate: true, deep: true })
    const handleInput = (v: string): void => {
      if (titleComponent.value)titleComponent.value.title = v
      if (titleComponent.value)chartEditStore.sycShareData(titleComponent.value)
    }
    return () => (
      <div style={{ margin: '10px' }}>
        <Form>
          <FormItem label='主标题' label-placement='left'>
            <Input
              v-model:value={titleName.value}
              onInput={handleInput}
              maxlength={20}
              placeholder='输入标题'
            />
          </FormItem>
        </Form>
      </div>
    )
  },
})
