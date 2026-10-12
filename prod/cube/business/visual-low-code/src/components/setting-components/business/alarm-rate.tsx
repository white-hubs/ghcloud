import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Switch, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'alarm-rate',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const alarmStatusForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      alarmStatus: true,
      rateStyle: 'levelNumIon',
      rateStyleInner: 'registerNum',
      rateDistribution: true,
      distributionStyle: 'pie',
      distributionStyleInner: 'ripple',
      showList: true
    })
    const alarmStatusComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      alarmStatusComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'alarm-rate')
      if (alarmStatusComponent.value) {
        alarmStatusForm.value = alarmStatusComponent.value?.config
        alarmStatusForm.value.title = alarmStatusComponent.value?.title ?? ''
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
    watch(() => alarmStatusForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = alarmStatusForm.value
        chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      }
    }, { deep: true, immediate: true })
    const handleTitle = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.title = v
    }
    const levelStyleOption = [
      { label: '数值图标', value: 'levelNumIon' },
    ]
    const levelStyleInnerOption = [
      { label: '挂号总数', value: 'registerNum' },
    ]
    const distributionStyleOption = [
      { label: '饼图', value: 'pie' },
    ]
    const distributionStyleInnerOption = [
      { label: '水波图', value: 'ripple' },
    ]
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }, { label: '设备类型', value: 'deviceType' }]

    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={alarmStatusForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={alarmStatusForm.value.title}
              onUpdate:value={handleTitle}
              placeholder='输入标题'
              maxlength={20}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={alarmStatusForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='设备报警' label-placement='left'>
            <Switch disabled={!alarmStatusForm.value.showList && !alarmStatusForm.value.rateDistribution} v-model:value={alarmStatusForm.value.alarmStatus} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={alarmStatusForm.value.rateStyle} options={levelStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={alarmStatusForm.value.rateStyleInner} options={levelStyleInnerOption} value='radius' />
          </FormItem>

          <FormItem label='设备报警分布' label-placement='left'>
            <Switch disabled={!alarmStatusForm.value.showList && !alarmStatusForm.value.alarmStatus} v-model:value={alarmStatusForm.value.rateDistribution} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={alarmStatusForm.value.distributionStyle} options={distributionStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={alarmStatusForm.value.distributionStyleInner} options={distributionStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='设备报警明细' label-placement='left'>
            <Switch disabled={!alarmStatusForm.value.alarmStatus && !alarmStatusForm.value.rateDistribution} v-model:value={alarmStatusForm.value.showList} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
