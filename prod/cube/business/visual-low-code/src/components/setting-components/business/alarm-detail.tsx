import { defineComponent, watch, ref } from 'vue'
import { Form, Input, FormItem, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
export default defineComponent({
  name: 'alarm-detail',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const alarmDetailForm = ref({
      title: '',
      deviceRange: ['allDevice'],
      showNumber: '5',
    })
    const alarmDetailComponent = ref<CreateComponentType | null>()
    // 获取当前组件
    const getComps = (): void => {
      alarmDetailComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, chartEditStore.getCurrentBlock, 'alarm-detail')
      if (alarmDetailComponent.value) {
        alarmDetailForm.value = alarmDetailComponent.value?.config
        alarmDetailForm.value.title = alarmDetailComponent.value?.title ?? ''
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
    watch(() => alarmDetailForm.value, () => {
      if (chartEditStore.getCurrentBlock) {
        chartEditStore.getCurrentBlock.config = alarmDetailForm.value
        chartEditStore.sycShareData(chartEditStore.getCurrentBlock)
      }
    }, { deep: true, immediate: true })
    const handleTitle = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.title = v
    }
    const showListOption = [
      { label: '5条', value: '5' },
      { label: '10条', value: '10' },
    ]
    const deviceRangeOption = [{ label: '全设备', value: 'allDevice' }, { label: '设备类型', value: 'deviceType' }]
    return () => (
      <div style={{ margin: '10px' }}>
        <Form model={alarmDetailForm.value}>
          <FormItem label='图表标题' label-placement='left'>
            <Input
              v-model:value={alarmDetailForm.value.title}
              onUpdate:value={handleTitle}
              placeholder='输入标题'
              maxlength={20}
            />
          </FormItem>
          <FormItem label='取值范围' label-placement='left'>
            <Select multiple v-model:value={alarmDetailForm.value.deviceRange} options={deviceRangeOption} />
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='展示条数' label-placement='left'>
            <RadioGroup checked v-model:value={alarmDetailForm.value.showNumber} options={showListOption} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
