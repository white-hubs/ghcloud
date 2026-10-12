import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Switch, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'device-type',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const deviceTypeForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      statusDistribution: true,
      chartStyle: 'pie',
      chartStyleInner: 'radius',
      chartPosition: 'direction-top',
      deviceStatusDetail: true
    })
    const deviceTypeComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      deviceTypeComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'device-type')
      if (deviceTypeComponent.value) {
        deviceTypeForm.value = deviceTypeComponent.value?.config
        deviceTypeForm.value.title = deviceTypeComponent.value?.title ?? ''
      }
    }
    watch(() => chartEditStore.active.pageId, () => {
      getComps()
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      if (chartEditStore.active.targetId.length > 0) {
        getComps()
      }
    }, { immediate: true, deep: true })
    // 同步同源数据
    watch(() => deviceTypeForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = deviceTypeForm.value
        chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      }
    }, { deep: true, immediate: true })
    const handleTitle = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.title = v
    }
    const chartPositionOption = [
      { label: '靠上', value: 'direction-top' },
      { label: '靠下', value: 'direction-bottom' },
      { label: '靠左', value: 'direction-left' },
      { label: '靠右', value: 'direction-right' },
    ]
    const chartStyleOption = [
      { label: '饼图', value: 'pie' },
    ]
    const chartStyleInnerOption = [
      { label: '环形饼图', value: 'radius' },
    ]
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }]

    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={deviceTypeForm.value}>
          <FormItem label='图标标题' label-placement='left'>
            <Input
              v-model:value={deviceTypeForm.value.title}
              onInput={handleTitle}
              maxlength={20}
              placeholder='输入标题'
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={deviceTypeForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='设备状态分布' label-placement='left'>
            <Switch disabled={!deviceTypeForm.value.deviceStatusDetail} v-model:value={deviceTypeForm.value.statusDistribution} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceTypeForm.value.chartStyle} options={chartStyleOption} />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceTypeForm.value.chartStyleInner} options={chartStyleInnerOption} />
          </FormItem>
          <FormItem label='图例' label-placement='left'>
            <RadioGroup v-model:value={deviceTypeForm.value.chartPosition} options={chartPositionOption} />
          </FormItem>
          <FormItem label='设备状态明细' label-placement='left'>
            <Switch disabled={!deviceTypeForm.value.statusDistribution} v-model:value={deviceTypeForm.value.deviceStatusDetail} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
