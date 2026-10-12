import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Switch, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'device-offline',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const deviceOfflineForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      deviceOffline: true,
      deviceOfflineStyle: 'numIcon',
      deviceOfflineStyleInner: 'registerNum',
      deviceOfflineDistribution: true,
      distributionStyle: 'histogram',
      distributionStyleInner: 'horizontal-bar-chart',
      chartPosition: 'bottom',
      deviceDetailList: true
    })
    const deviceOfflineComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      deviceOfflineComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'device-offline')
      if (deviceOfflineComponent.value) {
        deviceOfflineForm.value = deviceOfflineComponent.value?.config
        deviceOfflineForm.value.title = deviceOfflineComponent.value?.title ?? ''
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
    watch(() => deviceOfflineForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = deviceOfflineForm.value
        chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      }
    }, { deep: true, immediate: true })
    const handleTitle = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.title = v
    }
    const chartPositionOption = [
      { label: '靠上', value: 'top' },
      { label: '靠下', value: 'bottom' },
    ]
    const deviceOfflineStyleOption = [
      { label: '数值图标', value: 'numIcon' },
    ]
    const deviceOfflineStyleInnerOption = [
      { label: '挂号总数', value: 'registerNum' },
    ]
    const distributionStyleOption = [
      { label: '柱状图', value: 'histogram' },
    ]
    const distributionStyleInnerOption = [
      { label: '水平柱状图', value: 'horizontal-bar-chart' },
    ]
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }, { label: '设备类型', value: 'deviceType' }]

    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={deviceOfflineForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={deviceOfflineForm.value.title}
              onUpdate:value={handleTitle}
              placeholder='输入标题'
              maxlength={20}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={deviceOfflineForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='设备离线' label-placement='left'>
            <Switch disabled={!deviceOfflineForm.value.deviceOfflineDistribution && !deviceOfflineForm.value.deviceDetailList} v-model:value={deviceOfflineForm.value.deviceOffline} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceOfflineForm.value.deviceOfflineStyle} options={deviceOfflineStyleOption} />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceOfflineForm.value.deviceOfflineStyleInner} options={deviceOfflineStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='设备离线分布' label-placement='left'>
            <Switch disabled={!deviceOfflineForm.value.deviceOffline && !deviceOfflineForm.value.deviceDetailList} v-model:value={deviceOfflineForm.value.deviceOfflineDistribution} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceOfflineForm.value.distributionStyle} options={distributionStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceOfflineForm.value.distributionStyleInner} options={distributionStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='图例' label-placement='left'>
            <RadioGroup checked v-model:value={deviceOfflineForm.value.chartPosition} options={chartPositionOption} />
          </FormItem>
          <FormItem label='设备离线明细' label-placement='left'>
            <Switch disabled={!deviceOfflineForm.value.deviceOffline && !deviceOfflineForm.value.deviceOfflineDistribution} v-model:value={deviceOfflineForm.value.deviceDetailList} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
