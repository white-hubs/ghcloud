import { defineComponent, ref, watch } from 'vue'
import { Form, FormItem, TreeSelect } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import {
  ComponentCategoryEnum,
  type CreateComponentType
} from '@/store/modules/chart-edit-store/chart-edit-store.d'
export default defineComponent({
  name: 'page-title',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const tdConfigForm = ref({ showModel: '', modelPath: '' })
    const tdConfigComponent = ref<CreateComponentType | null>()
    const tdConfigOption = ref<CreateComponentType[] | []>([])
    const tdConfigLoading = ref(true)
    watch(() => chartEditStore.active.targetId, () => {
      // 获取当前的二维组态组件
      tdConfigComponent.value = chartEditStore.getCurrentPageComponents.find(x => x.category === ComponentCategoryEnum.TDCONFIGURATION)
      tdConfigOption.value = tdConfigComponent.value?.config.nav
      if ((tdConfigOption.value && tdConfigOption.value?.length > 0) ?? (!tdConfigOption.value))tdConfigLoading.value = false
      tdConfigForm.value.showModel = tdConfigComponent.value?.config.showModel
      tdConfigForm.value.modelPath = tdConfigComponent.value?.config.modelPath
    }, { immediate: true, deep: true })
    const updateModelTarget = (val: { value: string;option: { directory: string; }; }): void => {
      tdConfigForm.value.showModel = val.value
      tdConfigForm.value.modelPath = val.option.directory
      if (tdConfigComponent.value?.config) {
        tdConfigComponent.value.config.showModel = tdConfigForm.value.showModel
        tdConfigComponent.value.config.modelPath = tdConfigForm.value.modelPath
      }
    }
    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={tdConfigForm}>
          <FormItem label='默认展示' label-placement='left'>
            <TreeSelect
              loading={tdConfigLoading.value}
              options={tdConfigOption.value}
              value={tdConfigForm.value.showModel}
              virtual-scroll
              label-field='name'
              key-field='id'
              onUpdateValue={updateModelTarget}
            />
          </FormItem>
        </Form>
      </div>
    )
  },
})
