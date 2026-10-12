import { defineComponent, reactive, ref, watch, nextTick } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import OperateDays from '@/components/common/business/operate-days'
import GridContainer from '@/components/common/business/grid-container'
import '@/components/common/business/style/operate-days.less'
import '@/components/config-components/business-panel/style/device-status.less'
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
  name: 'device-status',
  props: ['style', 'item'],
  setup: (props) => {
    const equipmentData = reactive({
      deviceNum: 10,
      devices: [],
      deviceGenreNumbs: {},
    })
    const deviceNum = [
      {
        name: '正常',
        key: 'normal',
        value: 200,
        color: '#29C2FF'
      },
      {
        name: '故障',
        key: 'fault',
        value: 200,
        color: '#FFC700'
      },
      {
        name: '报警',
        key: 'alarm',
        value: 200,
        color: '#F14545'
      },
      {
        name: '离线',
        key: 'offline',
        value: 200,
        color: '#00ffff'
      },
    ]
    const deviceNumber = ref<DeviceNumberType[]>([])
    const deviceState = [
      {
        alarmStatusName: '正常',
        alarmNum: 223,
        alarmStatus: 'normal',
        color: '#29C2FF',
      },
      {
        alarmStatusName: '故障',
        alarmNum: 223,
        alarmStatus: 'fault',
        color: '#FFC700',
      },
      {
        alarmStatusName: '报警',
        alarmNum: 223,
        alarmStatus: 'alarm',
        color: '#F14545',
      },
      {
        alarmStatusName: '离线',
        alarmNum: 223,
        alarmStatus: 'offline',
        color: '#00ffff',
      },
    ]
    const deviceStatistic = ref<DeviceStatisticType[]>([])
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
        status: '状态1',
        number: '121',
        Proportion: '12',
      }, {
        status: '状态1',
        number: '121',
        Proportion: '12',
      }, {
        status: '状态1',
        number: '121',
        Proportion: '12',
      }, {
        status: '状态1',
        number: '121',
        Proportion: '12',
      }, {
        status: '状态1',
        number: '121',
        Proportion: '12',
      }, {
        status: '状态1',
        number: '121',
        Proportion: '12',
      },
    ])
    const ringRatioSlot = {
      default: () => {
        return deviceComponent.value?.config?.deviceNumStyleInner !== 'registerNum' ? <RingRatio chainRatio={100} /> : null
      }
    }
    const chartEditStore = useChartEditStore()
    const deviceComponent = ref<CreateComponentType | null>()
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      deviceComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'device-status')
      nextTick(() => {
        const numStyle = deviceComponent.value?.config?.numStyle as string[]
        deviceNumber.value = deviceNum.filter(device => {
          return numStyle.some((x: string) => x === device.key)
        })
        deviceStatistic.value = deviceState.filter(device => {
          return numStyle.some((x: string) => x === device.alarmStatus)
        })
      })
    }, { deep: true, immediate: true })

    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={deviceComponent.value?.title}>
          <div v-show={deviceComponent.value?.config.deviceNum}>
            <OperateDays
              title='设备总数'
              value={equipmentData.deviceNum}
              showRatio={deviceComponent.value?.config?.showRatio}
              v-slots={ringRatioSlot}
              class='body-num'
            />
          </div>
          {/* 设备状态 */}
          <div v-show={deviceComponent.value?.config.deviceStatus} style={{ marginTop: '10px' }}>
            <GridContainer data={deviceStatistic.value} />
          </div>
          {/* 设备类型 */}
          <div v-show={deviceComponent.value?.config.statusDistribution} class='ring-box'>
            <div class={deviceComponent.value?.config?.chartPosition}>
              <div class='chart' style={{ width: '180px', height: '160px' }}>
                <RingChart
                  pieData={deviceNumber.value}
                  seriesName='设备总数'
                  total={equipmentData.deviceNum}
                  unit='%'
                />
              </div>
              <div style={{ marginTop: '10px' }} class='grid-container'>
                {
                    deviceNumber.value.map(item =>
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
          <div v-show={deviceComponent.value?.config.showList}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
