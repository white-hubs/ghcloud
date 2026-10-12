import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Select, Switch } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'alarm-trend',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const alarmTrendForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      alarmNum: true,
      alarmNumStyle: 'numIcon',
      alarmNumStyleInner: 'registerNum',
      alarmTrend: true,
      trendStyle: 'trendIcon',
      trendStyleInner: 'linerTrendIcon',
      showList: true
    })
    const alarmNumStyleOption = [{ label: '数值图标', value: 'numIcon' }]
    const alarmNumStyleInnerOption = [{ label: '挂号总数', value: 'registerNum' }]
    const alarmTrendComponent = ref<CreateComponentType | null>()
    const trendStyleOption = [{ label: '趋势图', value: 'trendIcon' }]
    const trendStyleInnerOption = [{ label: '线性趋势图', value: 'linerTrendIcon' }]
    // 获取当前组件
    const getComps = (): void => {
      alarmTrendComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'alarm-trend')
      if (alarmTrendComponent.value) {
        alarmTrendForm.value = alarmTrendComponent.value?.config
        alarmTrendForm.value.title = alarmTrendComponent.value?.title ?? ''
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
    watch(() => alarmTrendForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = alarmTrendForm.value
        chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      }
    }, { deep: true, immediate: true })
    const handleTitle = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.title = v
    }
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }, { label: '设备类型', value: 'deviceType' }]
    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={alarmTrendForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={alarmTrendForm.value.title}
              onUpdate:value={handleTitle}
              placeholder='输入标题'
              maxlength={20}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={alarmTrendForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='报警总数' label-placement='left'>
            <Switch disabled={!alarmTrendForm.value.alarmTrend && !alarmTrendForm.value.showList} v-model:value={alarmTrendForm.value.alarmNum} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={alarmTrendForm.value.alarmNumStyle} options={alarmNumStyleOption} />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={alarmTrendForm.value.alarmNumStyleInner} options={alarmNumStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='报警趋势' label-placement='left'>
            <Switch disabled={!alarmTrendForm.value.alarmNum && !alarmTrendForm.value.showList} v-model:value={alarmTrendForm.value.alarmTrend} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={alarmTrendForm.value.trendStyle} options={trendStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={alarmTrendForm.value.trendStyleInner} options={trendStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='报警趋势明细' label-placement='left'>
            <Switch disabled={!alarmTrendForm.value.alarmNum && !alarmTrendForm.value.alarmTrend} v-model:value={alarmTrendForm.value.showList} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
