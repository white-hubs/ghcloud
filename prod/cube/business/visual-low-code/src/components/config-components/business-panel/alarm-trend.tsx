import { defineComponent, ref, watch, reactive } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import OperateDays from '@/components/common/business/operate-days'
import DateInlineForm from '@/components/common/business/date-inline-form'
import '@/components/common/business/style/operate-days.less'
import LineChart from '@/components/common/business/line-chart.tsx'
import RollTable from '@/components/common/business/roll-table.tsx'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import RingRatio from '@/components/common/business/ring-ratio'
import { getComponentByType } from '@/utils'

export default defineComponent({
  name: 'alarm-trend',
  props: ['style', 'item'],
  setup: (props) => {
    const equipmentData = reactive({
      alarmNum: 10
    })
    const columns = ref([
      {
        title: '时间',
        dataIndex: 'time',
      },
      {
        title: '报警数量',
        dataIndex: 'number',
      },
    ])
    const data = ref([
      {
        time: '12',
        number: '121',
      },
      {

        time: '121',
        number: '121',
      },
      {

        time: '121',
        number: '121',
      },
      {

        time: '121',
        number: '121',
      },
    ])
    const receptionTrendsChartData = reactive({
      xData: ['14', '18', '22', '26', '30'],
      yData: [
        { name: '故障次数', data: [21, 35, 20, 30, 50, 80], linearGradientColor: ['rgba(0, 136, 252)', 'rgba(120, 252, 252, 0.1)'], lineColor: 'rgba(0, 136, 252)' },
      ]
    })
    const titles = ref<string[]>([])
    titles.value = receptionTrendsChartData.yData.map((item) => item.name)
    const ringRatioSlot = {
      default: () => {
        return <RingRatio chainRatio={100} />
      }
    }
    const chartEditStore = useChartEditStore()
    const alarmComponent = ref<CreateComponentType | null>()
    // 获取所有报警组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      alarmComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'alarm-trend')
    }, { deep: true, immediate: true })
    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={alarmComponent.value?.title} v-slots={{ extra: () => <DateInlineForm /> }}>
          <div v-show={alarmComponent.value?.config.alarmNum}>
            <OperateDays
              title='报警数'
              value={equipmentData.alarmNum}
              v-slots={ringRatioSlot}
              class='body-num'
            />
          </div>
          <div v-show={alarmComponent.value?.config.alarmTrend}>
            <LineChart
              x-data={receptionTrendsChartData.xData} series={receptionTrendsChartData.yData}
              titles={titles.value}
              axisPointer
              showLegend={false} gridTop='15' unit={{ x: '', y: '次' }}
            />
          </div>
          <div v-show={alarmComponent.value?.config.showList}>
            <RollTable column={columns.value} data={data.value}>  </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
