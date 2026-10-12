import { defineComponent, ref, watch, reactive } from 'vue'
import DateInlineForm from '@/components/common/business/date-inline-form'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import GridContainer from '@/components/common/business/grid-container'
import '@/components/common/business/style/operate-days.less'
import '@/components/config-components/business-panel/style/alarm-level.less'
import RollTable from '@/components/common/business/roll-table.tsx'
import WaterPolo from '@/components/common/business/water-polo/water-polo.tsx'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
interface AlarmRate {
  deviceTotal: string;
  alarmNum: string;
  chainRatio: string;
  proportion: number;
}
export interface AlarmRateList {
  title: string;
  value: number | string;
  ringRatio?: boolean;
  color?: string;
  label?: string | number;
  unit?: string;
}
export default defineComponent({
  name: 'alarm-rate',
  props: ['style', 'item'],
  setup: (props) => {
    const alarmState = [
      {
        alarmStatusName: '报警',
        alarmNum: '23%',
        alarmStatus: 'alarmNum',
        color: '#29C2FF',
      },
      {
        alarmStatusName: '报警率',
        alarmNum: '22%',
        alarmStatus: 'alarmRate',
        color: '#00ffff',
      },
    ]

    const columns = ref([
      {
        title: '正常',
        dataIndex: 'status',
        width: '120',
      },
      {
        title: '报警',
        dataIndex: 'number',
      },
      {
        title: '报警率',
        dataIndex: 'Proportion',
      },
    ])
    const data = ref([
      {
        status: '四级',
        number: '121',
        Proportion: '12',
      }, {
        status: '四级',
        number: '121',
        Proportion: '12',
      }, {
        status: '四级',
        number: '121',
        Proportion: '12',
      }, {
        status: '四级',
        number: '121',
        Proportion: '12',
      }, {
        status: '四级',
        number: '121',
        Proportion: '12',
      }, {
        status: '四级',
        number: '121',
        Proportion: '12',
      },
    ])
    const alarmRateData = reactive<AlarmRate>({
      proportion: 0,
      deviceTotal: '',
      alarmNum: '',
      chainRatio: '',
    })
    const chartEditStore = useChartEditStore()
    const alarmComponent = ref<CreateComponentType | null>()
    // 获取所有报警组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      alarmComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'alarm-rate')
    }, { deep: true, immediate: true })

    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={alarmComponent.value?.title} v-slots={{ extra: () => <DateInlineForm /> }}>
          {/* 报警级别 */}
          <div v-show={alarmComponent.value?.config.alarmStatus} style={{ marginTop: '10px' }}>
            <GridContainer data={alarmState} />
          </div>
          <div v-show={alarmComponent.value?.config.rateDistribution} class='equipmentInfo'>
            <WaterPolo
              title=''
              value={alarmRateData.proportion}
              unit='%'
              bgColor='rgba(246, 1, 2, 0.4)'
              color='#f60102'
            />
          </div>
          <div v-show={alarmComponent.value?.config.showList}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
