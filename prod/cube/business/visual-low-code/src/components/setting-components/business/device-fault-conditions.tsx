import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Switch, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import { getComponentByType } from '@/utils'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'

export default defineComponent({
  name: 'device-fault-conditions',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const deviceFaultForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      isDeviceFault: true,
      deviceFaultStyle: { main: 'pie', item: 'radius' },
      isDeviceFaultDistribution: true,
      distributionStyle: { main: 'pie', item: 'radius' },
      legendDirection: 'direction-right',
      isDeviceFaultItem: true
    })
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
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }, { label: '设备类型', value: 'deviceType' }]
    const deviceFaultComponent = ref<CreateComponentType | null>()
    watch(() => chartEditStore.active.pageId, () => {
      deviceFaultComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'device-fault-conditions')
      deviceFaultForm.value = deviceFaultComponent.value?.config
      deviceFaultForm.value.title = deviceFaultComponent.value?.title ?? ''
    }, { immediate: true, deep: true })
    watch(() => chartEditStore.active.targetId, () => {
      if (chartEditStore.active.targetId.length > 0) {
        deviceFaultComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'device-fault-conditions')
        deviceFaultForm.value = deviceFaultComponent.value?.config
        deviceFaultForm.value.title = deviceFaultComponent.value?.title ?? ''
      }
    }, { immediate: true, deep: true })
    watch(() => deviceFaultForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = deviceFaultForm.value
        chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      }
    }, { deep: true, immediate: true })
    const handleTitle = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.title = v
    }
    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={deviceFaultForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={deviceFaultForm.value.title}
              placeholder='输入标题'
              maxlength={20}
              onUpdate:value={handleTitle}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={deviceFaultForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='设备故障' label-placement='left'>
            <Switch disabled={!deviceFaultForm.value.isDeviceFaultDistribution && !deviceFaultForm.value.isDeviceFaultItem} v-model:value={deviceFaultForm.value.isDeviceFault} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceFaultForm.value.deviceFaultStyle.main} options={chartStyleOption} />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceFaultForm.value.deviceFaultStyle.item} options={chartStyleInnerOption} />
          </FormItem>
          <FormItem label='设备故障分布' label-placement='left'>
            <Switch disabled={!deviceFaultForm.value.isDeviceFault && !deviceFaultForm.value.isDeviceFaultItem} v-model:value={deviceFaultForm.value.isDeviceFaultDistribution} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceFaultForm.value.distributionStyle.main} options={chartStyleOption} />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceFaultForm.value.distributionStyle.item} options={chartStyleInnerOption} />
          </FormItem>
          <FormItem label='图例' label-placement='left'>
            <RadioGroup options={chartPositionOption} v-model:value={deviceFaultForm.value.legendDirection} />
          </FormItem>
          <FormItem label='设备故障明细' label-placement='left'>
            <Switch disabled={!deviceFaultForm.value.isDeviceFault && !deviceFaultForm.value.isDeviceFaultDistribution} v-model:value={deviceFaultForm.value.isDeviceFaultItem} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
