import { defineComponent, ref, watch } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import GridContainer from '@/components/common/business/grid-container'
import RollTable from '@/components/common/business/roll-table'
import StackedBarChart from '@/components/common/business/stacked-bar-chart'
export default defineComponent({
  name: 'device-offline',
  props: ['style', 'item'],
  setup: (props) => {
    const deviceStatistic = ref([
      {
        alarmStatusName: '离线',
        alarmNum: 22,
        alarmStatus: '',
        color: '#2970FF',
      },
      {
        alarmStatusName: '离线率',
        alarmNum: '2.2%',
        alarmStatus: '',
        color: '#2AE8BD',
      },
    ])
    const columns = ref([
      {
        title: '区域',
        dataIndex: 'section',
      },
      {
        title: '正常',
        dataIndex: 'online',
      },
      {
        title: '故障',
        dataIndex: 'offline',
        width: '120',
      },
      {
        title: '故障率',
        dataIndex: 'offLineRate',
      },

    ])
    const data = ref([
      {
        section: '100',
        online: '100',
        offline: '100',
        offLineRate: '100%',
      },
      {
        section: '100',
        online: '100',
        offline: '100',
        offLineRate: '100%',
      },
      {
        section: '100',
        online: '100',
        offline: '100',
        offLineRate: '100%',
      },
      {
        section: '100',
        online: '100',
        offline: '100',
        offLineRate: '100%',
      }
    ])
    const chartEditStore = useChartEditStore()
    const deviceOfflineComponent = ref<CreateComponentType | null>()
    const xData = ref<string[]>([])
    const yData = ref<{ name: string; data: number[]; color: string; }[]>([])
    xData.value = ['一级区域', '门诊大楼', '住院大楼', '急诊大楼']
    yData.value = [{
      name: '在线',
      data: [200, 100, 300, 100],
      color: '#2AE8BD'
    },
    {
      name: '离线',
      data: [20, 30, 60, 40],
      color: '#2989FF'
    }]
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      deviceOfflineComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'device-offline')
    }, { deep: true, immediate: true })
    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={deviceOfflineComponent.value?.title}>
          <div v-show={deviceOfflineComponent.value?.config?.deviceOffline} style={{ marginTop: '10px' }}>
            <GridContainer data={deviceStatistic.value} />
          </div>
          <div v-show={deviceOfflineComponent.value?.config?.deviceOfflineDistribution} style={{ height: '220px' }}>
            <StackedBarChart x-data={xData.value} y-data={yData.value} legendPosition={deviceOfflineComponent.value?.config?.chartPosition} />
          </div>
          <div v-show={deviceOfflineComponent.value?.config?.deviceDetailList}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
