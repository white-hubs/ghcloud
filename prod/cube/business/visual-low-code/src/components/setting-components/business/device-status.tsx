import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Switch, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import { CheckboxGroup } from '@ghcloud/cube-ui'
export default defineComponent({
  name: 'device-status',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const deviceStatusForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      deviceNum: true,
      deviceNumStyle: 'numIcon',
      deviceNumStyleInner: 'registerNum',
      deviceStatus: true,
      statusStyle: 'statusNumIon',
      statusStyleInner: 'numName',
      numStyle: [],
      statusDistribution: true,
      distributionStyle: 'pie',
      distributionStyleInner: 'radius',
      chartPosition: 'direction-top',
      showList: true
    })
    const deviceStatusComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      deviceStatusComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'device-status')
      if (deviceStatusComponent.value) {
        deviceStatusForm.value = deviceStatusComponent.value?.config
        deviceStatusForm.value.title = deviceStatusComponent.value?.title ?? ''
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
    watch(() => deviceStatusForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = deviceStatusForm.value
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
    const deviceNumStyleOption = [
      { label: '数值图标', value: 'numIcon' },
    ]
    const deviceNumStyleInnerOption = [
      { label: '挂号总数', value: 'registerNum' },
    ]
    const statusStyleOption = [
      { label: '数值图标', value: 'statusNumIon' },
    ]
    const statusStyleInnerOption = [
      { label: '数值名称', value: 'numName' },
    ]
    const numStyleOption = [
      { label: '正常', value: 'normal' },
      { label: '故障', value: 'fault' },
      { label: '报警', value: 'alarm' },
      { label: '离线', value: 'offline' },
    ]
    const distributionStyleOption = [
      { label: '饼图', value: 'pie' },
    ]
    const distributionStyleInnerOption = [
      { label: '环形饼图', value: 'radius' },
    ]
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }, { label: '设备类型', value: 'deviceType' }]

    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={deviceStatusForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={deviceStatusForm.value.title}
              onUpdate:value={handleTitle}
              placeholder='输入标题'
              maxlength={20}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={deviceStatusForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='设备总数' label-placement='left'>
            <Switch disabled={!deviceStatusForm.value.showList && !deviceStatusForm.value.statusDistribution && !deviceStatusForm.value.deviceStatus} v-model:value={deviceStatusForm.value.deviceNum} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceStatusForm.value.deviceNumStyle} options={deviceNumStyleOption} />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceStatusForm.value.deviceNumStyleInner} options={deviceNumStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='设备状态' label-placement='left'>
            <Switch disabled={!deviceStatusForm.value.showList && !deviceStatusForm.value.statusDistribution && !deviceStatusForm.value.deviceNum} v-model:value={deviceStatusForm.value.deviceStatus} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceStatusForm.value.statusStyle} options={statusStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceStatusForm.value.statusStyleInner} options={statusStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='个数' label-placement='left'>
            <CheckboxGroup v-model:value={deviceStatusForm.value.numStyle} options={numStyleOption} value='pie' />
          </FormItem>
          <FormItem label='设备状态分布' label-placement='left'>
            <Switch disabled={!deviceStatusForm.value.showList && !deviceStatusForm.value.deviceStatus && !deviceStatusForm.value.deviceNum} v-model:value={deviceStatusForm.value.statusDistribution} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceStatusForm.value.distributionStyle} options={distributionStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceStatusForm.value.distributionStyleInner} options={distributionStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='图例' label-placement='left'>
            <RadioGroup checked v-model:value={deviceStatusForm.value.chartPosition} options={chartPositionOption} />
          </FormItem>
          <FormItem label='设备状态明细' label-placement='left'>
            <Switch disabled={!deviceStatusForm.value.deviceStatus && !deviceStatusForm.value.statusDistribution && !deviceStatusForm.value.deviceNum} v-model:value={deviceStatusForm.value.showList} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
