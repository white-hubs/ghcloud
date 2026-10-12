import { defineComponent, reactive, ref, watch } from 'vue'
import DateInlineForm from '@/components/common/business/date-inline-form'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import OperateDays from '@/components/common/business/operate-days'
import GridContainer from '@/components/common/business/grid-container'
import '@/components/config-components/business-panel/style/device-statistics.less'
import RingChart from '@/components/common/business/echarts/ring-chart.tsx'
import RollTable from '@/components/common/business/roll-table.tsx'
import '@/components/common/business/style/operate-days.less'
import RingRatio from '@/components/common/business/ring-ratio.tsx'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'

export default defineComponent({
  name: 'DeviceStatistics',
  props: ['style', 'item'],
  setup: (props) => {
    const equipmentData = reactive({
      deviceNum: 10,
      devices: [],
      deviceGenreNumbs: {},
    })
    const pieData = ref([
      {
        name: '消防栓',
        value: 200,
        color: '#29C2FF'
      },
      {
        name: '灭火器',
        value: 200,
        color: '#74AEE7'
      },
      {
        name: '消防设备',
        value: 200,
        color: '#FFC700'
      },
      {
        name: '消防栓1',
        value: 200,
        color: '#655DD1'
      },
      {
        name: '消防栓2',
        value: 200,
        color: '#655DD1'
      },
      {
        name: '消防栓3',
        value: 200,
        color: '#655DD1'
      },
      {
        name: '消防栓3',
        value: 200,
        color: '#655DD1'
      },
      {
        name: '消防栓3',
        value: 200,
        color: '#655DD1'
      },
    ])
    const deviceStatistic = ref([
      {
        alarmStatusName: '正常',
        alarmNum: 223,
        alarmStatus: '',
        color: '#00F27B',
      },
      {
        alarmStatusName: '故障',
        alarmNum: 223,
        alarmStatus: '',
        color: '#FFC700',
      },
      {
        alarmStatusName: '报警',
        alarmNum: 223,
        alarmStatus: '',
        color: '#F14545',
      },
      {
        alarmStatusName: '离线',
        alarmNum: 223,
        alarmStatus: '',
        color: '#29C2FF',
      },
    ])
    const columns = ref([
      {
        title: '类型',
        dataIndex: 'type',
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
        type: '类型1',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型2',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型3',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型4',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型3',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型4',
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
    const deviceComponent = ref<CreateComponentType | null>()
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      deviceComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'device-statistics')
    }, { deep: true, immediate: true })

    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={deviceComponent.value?.title} showDate={deviceComponent.value?.config?.showDate} v-slots={{ extra: () => <DateInlineForm /> }}>
          <div v-show={deviceComponent.value?.config?.devicesNum}>
            <OperateDays
              title='设备总数'
              value={equipmentData.deviceNum}
              class='body-num'
              showRatio={deviceComponent.value?.config?.showRatio}
              v-slots={ringRatioSlot}
            />
          </div>
          {/* 设备状态 */}
          <div v-show={deviceComponent.value?.config?.deviceStatus} style={{ marginTop: '10px' }}>
            <GridContainer data={deviceStatistic.value} />
          </div>
          {/* 设备类型 */}
          <div v-show={deviceComponent.value?.config?.deviceType}>
            <div class={deviceComponent.value?.config?.legendDirection}>
              <div class='chart' style={{ width: '180px', height: '160px' }}>
                <RingChart
                  pieData={pieData.value}
                  seriesName='设备总数'
                  total={equipmentData.deviceNum}
                  unit='%'
                />
              </div>
              <div style={{ marginTop: '10px' }} class='grid-container'>
                {
                    pieData.value.map(item =>
                      <div key={item.name} style='background:none' class='grid-item'>
                        <div class='title flex-start'>
                          <span style={{ backgroundColor: item.color }} class='dian' />
                          <span>{item.name}</span>
                        </div>
                        <div style={{ marginLeft: '10px' }}>
                          {item.value}
                        </div>
                      </div>
                    )
                  }
              </div>
            </div>
          </div>
          <div v-show={deviceComponent.value?.config?.showList}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>

    )
  }
})
