import { defineComponent, onMounted, ref, watch } from 'vue'
import { Form, Input, FormItem, Switch, RadioGroup, Select } from '@ghcloud/visual-view-ui'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import { HeadLine } from '@/components/common/head-line'
import { getDeviceGenreList } from '@/apis/business/device'
import DeviceScope from '../../common/basic/batch-settings/device-scope'
export default defineComponent({
  name: 'device-statistics',
  setup: () => {
    const chartEditStore = useChartEditStore()
    const searchJobType = ref<string[] | string>([])
    const deviceRangeOption = ref<{ label: string; value: string; }[]>([{ label: '全部', value: 'ALL_SELECT' }])
    const handleInput = (): void => {
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const handleDevicesNum = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.devicesNum = v
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const handleRatio = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.showRatio = v
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const handleStatus = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.deviceStatus = v
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const handleType = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.deviceType = v
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const handleShowDate = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.showDate = v
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const handleLegend = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.legendDirection = v
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const handleList = (v: string): void => {
      if (chartEditStore.getCurrentBlock)chartEditStore.getCurrentBlock.config.showList = v
      chartEditStore.setTargetComp(chartEditStore.getCurrentBlock?.id)
    }
    const chartPositionOption = [
      { label: '靠上', value: 'direction-top' },
      { label: '靠下', value: 'direction-bottom' },
      { label: '靠左', value: 'direction-left' },
      { label: '靠右', value: 'direction-right' },
    ]
    const showAndHide = [
      { label: '展示', value: true },
      { label: '隐藏', value: false },
    ]
    const chartStyleOption = [
      { label: '饼图', value: 'pie' },
    ]
    const chartStyleInnerOption = [
      { label: '环形饼图', value: 'radius' },
    ]
    const stateStyleOption = [
      { label: '数值图标', value: 'chart' },
    ]
    const stateStyleInnerOption = [
      { label: '数值名称', value: 'name' },
    ]
    // 获取设备类型列表
    const requestDeviceGenreList = async (): Promise<void> => {
      const { data } = await getDeviceGenreList()
      data.forEach((item: { name: string; id: string; }) => {
        deviceRangeOption.value.push({
          label: item.name,
          value: item.id
        })
      })
    }
    watch(() => chartEditStore.active.pageId, () => {
      requestDeviceGenreList()
    }, { immediate: true, deep: true })

    watch(() => chartEditStore.getCurrentBlock, () => {
      chartEditStore.sycShareData(chartEditStore.getCurrentBlock!)
    }, { deep: true, immediate: true })

    onMounted(() => {
      if (chartEditStore.getCurrentBlock) {
        searchJobType.value = chartEditStore.getCurrentBlock.config.deviceRange ? chartEditStore.getCurrentBlock.config.deviceRange : []
      }
    })
    return () => (
      <div style={{ margin: '10px' }}>
        <Form>
          <FormItem label='元素名称' label-placement='left'>
            <Input
              v-model:value={chartEditStore.getCurrentBlock.title}
              onInput={handleInput}
              maxlength={20}
              placeholder='输入标题'
            />
          </FormItem>
          <FormItem label='设备范围' label-placement='left'>
            <DeviceScope />
            {/* <Select v-model:value={searchJobType.value} multiple clearable options={deviceRangeOption.value} onUpdateValue={updateDeviceRange} /> */}
          </FormItem>
          <HeadLine>图表内容设置</HeadLine>
          <FormItem label='日期选择' label-placement='left'>
            <Switch value={chartEditStore.getCurrentBlock.config?.showDate} onChange={handleShowDate} />
          </FormItem>
          <FormItem label='设备总数' label-placement='left'>
            <Switch value={chartEditStore.getCurrentBlock.config?.devicesNum} onChange={handleDevicesNum} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select options={chartStyleOption} value='pie' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select options={chartStyleInnerOption} value='radius' />
          </FormItem>
          <FormItem label='环比' label-placement='left'>
            <Switch value={chartEditStore.getCurrentBlock.config?.showRatio} onChange={handleRatio} />
          </FormItem>
          <FormItem label='设备状态' label-placement='left'>
            <Switch value={chartEditStore.getCurrentBlock.config?.deviceStatus} onChange={handleStatus} />
          </FormItem>
          <FormItem label='样式' label-placement='left'>
            <Select options={stateStyleOption} value='chart' />
            <span style={{ visibility: 'hidden' }}>&nbsp;</span>
            <Select options={stateStyleInnerOption} value='name' />
          </FormItem>
          <FormItem label='设备类型' label-placement='left'>
            <Switch value={chartEditStore.getCurrentBlock.config?.deviceType} onChange={handleType} />
          </FormItem>
          <FormItem label='图例' label-placement='left'>
            <RadioGroup onChange={handleLegend} options={chartPositionOption} value={chartEditStore.getCurrentBlock.config?.legendDirection} />
          </FormItem>
          <FormItem label='明细' label-placement='left'>
            <RadioGroup onChange={handleList} value={chartEditStore.getCurrentBlock.config?.showList} options={showAndHide} />
          </FormItem>
        </Form>
      </div>
    )
  },
})
