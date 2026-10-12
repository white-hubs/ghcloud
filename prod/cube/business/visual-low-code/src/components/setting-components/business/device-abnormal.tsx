import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Switch, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'device-abnormal',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const deviceAbnormalForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      deviceAbnormal: true,
      deviceAbnormalStyle: 'numIcon',
      deviceAbnormalStyleInner: 'registerNum',
      deviceAbnormalTrend: true,
      distributionStyle: 'histogram',
      distributionStyleInner: 'horizontal-bar-chart',
      chartPosition: 'bottom',
      deviceDetailList: true
    })
    const deviceAbnormalComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      deviceAbnormalComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'device-abnormal')
      if (deviceAbnormalComponent.value) {
        deviceAbnormalForm.value = deviceAbnormalComponent.value?.config
        deviceAbnormalForm.value.title = deviceAbnormalComponent.value?.title ?? ''
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
    watch(() => deviceAbnormalForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = deviceAbnormalForm.value
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
    const deviceAbnormalStyleOption = [
      { label: '数值图标', value: 'numIcon' },
    ]
    const deviceAbnormalStyleInnerOption = [
      { label: '挂号总数', value: 'registerNum' },
    ]
    const distributionStyleOption = [
      { label: '折线图', value: 'histogram' },
    ]
    const distributionStyleInnerOption = [
      { label: '水平柱状图', value: 'horizontal-bar-chart' },
    ]
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }, { label: '设备类型', value: 'deviceType' }]

    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={deviceAbnormalForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={deviceAbnormalForm.value.title}
              onUpdate:value={handleTitle}
              placeholder='输入标题'
              maxlength={20}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={deviceAbnormalForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='设备异常' label-placement='left'>
            <Switch disabled={!deviceAbnormalForm.value.deviceAbnormalTrend && !deviceAbnormalForm.value.deviceDetailList} v-model:value={deviceAbnormalForm.value.deviceAbnormal} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceAbnormalForm.value.deviceAbnormalStyle} options={deviceAbnormalStyleOption} />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceAbnormalForm.value.deviceAbnormalStyleInner} options={deviceAbnormalStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='设备异常趋势' label-placement='left'>
            <Switch disabled={!deviceAbnormalForm.value.deviceAbnormal && !deviceAbnormalForm.value.deviceDetailList} v-model:value={deviceAbnormalForm.value.deviceAbnormalTrend} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceAbnormalForm.value.distributionStyle} options={distributionStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceAbnormalForm.value.distributionStyleInner} options={distributionStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='图例' label-placement='left'>
            <RadioGroup checked v-model:value={deviceAbnormalForm.value.chartPosition} options={chartPositionOption} />
          </FormItem>
          <FormItem label='设备异常明细' label-placement='left'>
            <Switch disabled={!deviceAbnormalForm.value.deviceAbnormal && !deviceAbnormalForm.value.deviceAbnormalTrend} v-model:value={deviceAbnormalForm.value.deviceDetailList} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
