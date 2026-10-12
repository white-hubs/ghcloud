import { defineComponent, ref, watch } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import StackedBarChart from '@/components/common/business/stacked-bar-chart'
export default defineComponent({
  name: 'alarm-rank',
  props: ['style', 'item'],
  setup: (props) => {
    const chartEditStore = useChartEditStore()
    const alarmRankComponent = ref<CreateComponentType | null>()
    const xData = ref<string[]>([])
    const yData = ref<{ name: string; data: number[]; color: string; }[]>([])
    const data = {
      event: {
        xData: ['火灾报警', '区域闯入', '车辆违停', '烟雾报警', '冻库温度过低'],
        yData: [{
          name: '',
          data: [20, 30, 50, 40, 20],
          color: '#2989FF'
        }]
      },
      staff: {
        xData: ['张三', '李四', '王五', '钱刘', '刘启'],
        yData: [{
          name: '',
          data: [20, 30, 50, 40, 20],
          color: '#2989FF'
        }]
      },
      area: {
        xData: ['1号楼', '2号楼', '3号楼', '4号楼', '5号楼'],
        yData: [{
          name: '',
          data: [20, 30, 50, 40, 20],
          color: '#2989FF'
        }]
      },
      device: {
        xData: ['变频泵', '潜污泵', '集水井', '给水泵', '生活水箱'],
        yData: [{
          name: '',
          data: [20, 30, 50, 40, 20],
          color: '#2989FF'
        }]
      },
    }
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      alarmRankComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'alarm-rank')
      const statisticalCategory = alarmRankComponent.value?.config.statisticalCategory
      switch (statisticalCategory) {
        case 'event':
          xData.value = data.event.xData
          yData.value = data.event.yData
          break
        case 'staff':
          xData.value = data.staff.xData
          yData.value = data.staff.yData
          break
        case 'area':
          xData.value = data.area.xData
          yData.value = data.area.yData
          break
        case 'device':
          xData.value = data.device.xData
          yData.value = data.device.yData
          break
      }
    }, { deep: true, immediate: true })
    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={alarmRankComponent.value?.title}>
          <div style={{ height: '350px' }}>
            <StackedBarChart
              x-data={xData.value}
              y-data={yData.value}
              showLabel
              labelFormatter={(params: { value: string; }) => { return `${params.value}次 环比↑2%` }}
            />
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
