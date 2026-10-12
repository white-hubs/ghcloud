import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'alarm-rank',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const deviceOfflineForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      distributionStyle: 'histogram',
      distributionStyleInner: 'rank',
      statisticalCategory: 'event',
    })
    const alarmRankComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      alarmRankComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'alarm-rank')
      if (alarmRankComponent.value) {
        deviceOfflineForm.value = alarmRankComponent.value?.config
        deviceOfflineForm.value.title = alarmRankComponent.value?.title ?? ''
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
    const statisticalCategoryOption = [
      { label: '报警事件', value: 'event' },
      { label: '报警处理人员', value: 'staff' },
      { label: '报警区域', value: 'area' },
      { label: '报警设备', value: 'device' },
    ]
    const distributionStyleOption = [
      { label: '柱状图', value: 'histogram' },
    ]
    const distributionStyleInnerOption = [
      { label: '排名', value: 'rank' },
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
          <FormItem label='样式' label-placement='left'>
            <Select v-model:value={deviceOfflineForm.value.distributionStyle} options={distributionStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select v-model:value={deviceOfflineForm.value.distributionStyleInner} options={distributionStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='统计类别' label-placement='left'>
            <RadioGroup checked v-model:value={deviceOfflineForm.value.statisticalCategory} options={statisticalCategoryOption} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
