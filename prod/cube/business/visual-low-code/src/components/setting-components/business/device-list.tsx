import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import { getDeviceGenreList } from '@/apis/business/device.ts'
export default defineComponent({
  name: 'device-offline',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const deviceListForm = ref<{ title: string; deviceRange: string | undefined; }>({
      title: '',
      deviceRange: undefined,
    })
    const deviceRangeOption = ref<{ label: string; value: string; }[]>([])
    const deviceListComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      deviceListComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'device-list')
      if (deviceListComponent.value) {
        deviceListForm.value = deviceListComponent.value?.config
        deviceListForm.value.title = deviceListComponent.value?.title ?? ''
      }
    }
    // 获取设备类型列表
    const requestDeviceGenreList = async (): Promise<void> => {
      const { data } = await getDeviceGenreList()
      data.forEach((item: { name: string; id: string; }) => {
        deviceRangeOption.value.push({
          label: item.name,
          value: item.id
        })
      })
    }
    watch(() => chartEditStore.active.pageId, () => {
      requestDeviceGenreList()
      getComps()
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      if (chartEditStore.active.targetId.length > 0) {
        getComps()
      }
    }, { immediate: true, deep: true })
    // 同步同源数据
    watch(() => deviceListForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = deviceListForm.value
        chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      }
    }, { deep: true, immediate: true })
    const handleTitle = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.title = v
    }
    const updateDeviceRange = (val: string): void => {
      deviceListForm.value.deviceRange = val
    }
    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={deviceListForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={deviceListForm.value.title}
              onUpdate:value={handleTitle}
              placeholder='输入标题'
              maxlength={20}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select clearable v-model:value={deviceListForm.value.deviceRange} options={deviceRangeOption.value} onUpdateValue={updateDeviceRange} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
