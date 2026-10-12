import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, Switch, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import { CheckboxGroup } from '@ghcloud/cube-ui'
export default defineComponent({
  name: 'alarm-level',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const alarmStatusForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      alarmStatus: true,
      levelStyle: 'levelNumIon',
      levelStyleInner: 'numName',
      numStyle: [],
      levelDistribution: true,
      distributionStyle: 'pie',
      distributionStyleInner: 'radius',
      chartPosition: 'direction-top',
      showList: true
    })
    const alarmStatusComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      alarmStatusComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'alarm-level')
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
    const chartPositionOption = [
      { label: '靠上', value: 'direction-top' },
      { label: '靠下', value: 'direction-bottom' },
      { label: '靠左', value: 'direction-left' },
      { label: '靠右', value: 'direction-right' },
    ]
    const levelStyleOption = [
      { label: '数值图标', value: 'levelNumIon' },
    ]
    const levelStyleInnerOption = [
      { label: '数值名称', value: 'numName' },
    ]
    const numStyleOption = [
      { label: '一级', value: 'level1' },
      { label: '二级', value: 'level2' },
      { label: '三级', value: 'level3' },
      { label: '四级', value: 'level4' },
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
          <FormItem label='报警级别' label-placement='left'>
            <Switch disabled={!alarmStatusForm.value.showList && !alarmStatusForm.value.levelDistribution} v-model:value={alarmStatusForm.value.alarmStatus} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={alarmStatusForm.value.levelStyle} options={levelStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={alarmStatusForm.value.levelStyleInner} options={levelStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='个数' label-placement='left'>
            <CheckboxGroup v-model:value={alarmStatusForm.value.numStyle} options={numStyleOption} value='pie' />
          </FormItem>
          <FormItem label='报警级别分布' label-placement='left'>
            <Switch disabled={!alarmStatusForm.value.showList && !alarmStatusForm.value.alarmStatus} v-model:value={alarmStatusForm.value.levelDistribution} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={alarmStatusForm.value.distributionStyle} options={distributionStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={alarmStatusForm.value.distributionStyleInner} options={distributionStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='图例' label-placement='left'>
            <RadioGroup checked v-model:value={alarmStatusForm.value.chartPosition} options={chartPositionOption} />
          </FormItem>
          <FormItem label='报警级别明细' label-placement='left'>
            <Switch disabled={!alarmStatusForm.value.alarmStatus && !alarmStatusForm.value.levelDistribution} v-model:value={alarmStatusForm.value.showList} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
