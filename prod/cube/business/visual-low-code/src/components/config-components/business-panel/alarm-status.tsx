import { defineComponent, reactive, ref, watch, nextTick } from 'vue'
import DateInlineForm from '@/components/common/business/date-inline-form'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import OperateDays from '@/components/common/business/operate-days'
import GridContainer from '@/components/common/business/grid-container'
import '@/components/common/business/style/operate-days.less'
import '@/components/config-components/business-panel/style/alarm-status.less'
import RingChart from '@/components/common/business/echarts/ring-chart.tsx'
import RollTable from '@/components/common/business/roll-table.tsx'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'
import RingRatio from '@/components/common/business/ring-ratio'
interface DeviceNumberType {
  name: string;
  key: string;
  value: number;
  color: string;
}
interface DeviceStatisticType {
  alarmStatusName: string;
  alarmNum: number;
  alarmStatus: string;
  color: string;
}
export default defineComponent({
  name: 'alarm-status',
  props: ['style', 'item'],
  setup: (props) => {
    const equipmentData = reactive({
      alarmNum: 10
    })
    const alarmNum = [
      {
        name: '一级',
        key: 'level1',
        value: 200,
        color: '#29C2FF'
      },
      {
        name: '二级',
        key: 'level2',
        value: 200,
        color: '#FFC700'
      },
      {
        name: '三级',
        key: 'level3',
        value: 200,
        color: '#03c316'
      },
      {
        name: '四级',
        key: 'level4',
        value: 200,
        color: '#00ffff'
      },
    ]
    const alarmNumber = ref<DeviceNumberType[]>([])
    const alarmState = [
      {
        alarmStatusName: '一级',
        alarmNum: 223,
        alarmStatus: 'level1',
        color: '#29C2FF',
      },
      {
        alarmStatusName: '二级',
        alarmNum: 223,
        alarmStatus: 'level2',
        color: '#FFC700',
      },
      {
        alarmStatusName: '三级',
        alarmNum: 223,
        alarmStatus: 'level3',
        color: '#03c316',
      },
      {
        alarmStatusName: '四级',
        alarmNum: 223,
        alarmStatus: 'level4',
        color: '#00ffff',
      },
    ]
    const alarmStatistic = ref<DeviceStatisticType[]>([])
    const columns = ref([
      {
        title: '状态',
        dataIndex: 'status',
        width: '120',
      },
      {
        title: '数量',
        dataIndex: 'number',
      },
      {
        title: '占比',
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
    const ringRatioSlot = {
      default: () => {
        return <RingRatio chainRatio={100} />
      }
    }
    const chartEditStore = useChartEditStore()
    const alarmComponent = ref<CreateComponentType | null>()
    // 获取所有报警组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      alarmComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'alarm-status')
      nextTick(() => {
        const numStyle = alarmComponent.value?.config?.numStyle as string[]
        alarmNumber.value = alarmNum.filter(device => {
          return numStyle.some((x: string) => x === device.key)
        })
        alarmStatistic.value = alarmState.filter(device => {
          return numStyle.some((x: string) => x === device.alarmStatus)
        })
      })
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
          {/* 报警状态 */}
          <div v-show={alarmComponent.value?.config.alarmStatus} style={{ marginTop: '10px' }}>
            <GridContainer data={alarmStatistic.value} />
          </div>
          {/* 设备类型 */}
          <div v-show={alarmComponent.value?.config.statusDistribution} class='ring-box'>
            <div class={alarmComponent.value?.config?.chartPosition}>
              <div class='chart' style={{ width: '180px', height: '160px' }}>
                <RingChart
                  pieData={alarmNumber.value}
                  seriesName='设备总数'
                  total={equipmentData.alarmNum}
                />
              </div>
              <div style={{ marginTop: '10px' }} class='grid-container'>
                {
                    alarmNumber.value.map(item =>
                      <div key={item.name} style='background:none' class='grid-item'>
                        <div class='title flex-start'>
                          <span style={{ backgroundColor: item.color }} class='dian' />
                          <span>{item.name}</span>
                        </div>
                        <div style={{ marginLeft: '10px' }}>
                          {item.value}%
                        </div>
                      </div>
                    )
                  }
              </div>
            </div>
          </div>
          <div v-show={alarmComponent.value?.config.showList}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
