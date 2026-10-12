import { defineComponent, ref, watch, reactive } from 'vue'
import DateInlineForm from '@/components/common/business/date-inline-form'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import MonitorPanel from '@/components/common/business/monitor-panel.tsx'
// import StackedLine from '@/components/common/business/stacked-line.tsx'
import LineChart from '@/components/common/business/line-chart.tsx'
import RollTable from '@/components/common/business/roll-table.tsx'
import '@/components/common/business/style/operate-days.less'
import '@/components/config-components/business-panel/style/device-abnormal.less'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'

export default defineComponent({
  name: 'device-abnormal',
  props: ['style', 'item'],
  setup: (props) => {
    const columns = ref([
      {
        title: '日期',
        dataIndex: 'type',
        width: '120',
      },
      {
        title: '告警次数',
        dataIndex: 'number',
      },
      {
        title: '故障次数',
        dataIndex: 'Proportion',
      },
    ])
    const data = ref([
      {
        type: '111',
        number: '121',
        Proportion: '12',
      }, {
        type: '11',
        number: '121',
        Proportion: '12',
      }, {
        type: '11',
        number: '121',
        Proportion: '12',
      }, {
        type: '11',
        number: '121',
        Proportion: '12',
      }, {
        type: '11',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型',
        number: '121',
        Proportion: '12',
      },
    ])
    const monitorPanelData = ref([
      {
        imgPath: 'over-view29.png',
        value: 65,
        name: '告警次数'
      },
      {
        imgPath: 'over-view5.png',
        value: 98,
        name: '故障次数'
      },
    ])
    const receptionTrendsChartData = reactive({
      xData: ['4', '8', '12', '16', '20', '24'],
      yData: [
        { name: '故障次数', data: [510, 150, 120, 700, 550, 280], linearGradientColor: ['rgba(223, 187, 38)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(223, 187, 38)' },
        { name: '告警次数', data: [105, 130, 150, 100, 550, 80], linearGradientColor: ['rgba(223, 113, 68)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(223, 113, 68)' },
      ]
    })
    const chartEditStore = useChartEditStore()
    const deviceComponent = ref<CreateComponentType | null>()
    const titles = ref<string[]>([])
    titles.value = receptionTrendsChartData.yData.map((item) => item.name)
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      deviceComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'device-abnormal')
    }, { deep: true, immediate: true })

    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={deviceComponent.value?.title} v-slots={{ extra: () => <DateInlineForm /> }}>
          <div v-show={deviceComponent.value?.config.deviceAbnormal} class='monitorPanelBox'>
            {
                monitorPanelData.value.map(item => <MonitorPanel key={item.name} monitorPanelData={item} />)
              }
          </div>
          <div v-show={deviceComponent.value?.config.deviceAbnormalTrend}>
            <LineChart
              x-data={receptionTrendsChartData.xData} series={receptionTrendsChartData.yData}
              titles={titles.value}
              legendPosition={deviceComponent.value?.config.chartPosition}
              axisPointer
              showLegend gridTop='15' unit={{ x: '', y: '次' }}
            />
          </div>
          <div v-show={deviceComponent.value?.config.deviceDetailList}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
