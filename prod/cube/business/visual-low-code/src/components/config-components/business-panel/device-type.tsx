import { defineComponent, reactive, ref, watch } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import RingChart from '@/components/common/business/echarts/ring-chart.tsx'
import RollTable from '@/components/common/business/roll-table.tsx'
import '@/components/common/business/style/operate-days.less'
import '@/components/config-components/business-panel/style/device-type.less'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'

export default defineComponent({
  name: 'device-type',
  props: ['style', 'item'],
  setup: (props) => {
    const equipmentData = reactive({
      deviceNum: 10,
      devices: [],
      deviceGenreNumbs: {},
    })
    const deviceNumber = [
      {
        name: '监控',
        key: 'normal',
        value: 60,
        color: '#29C2FF'
      },
      {
        name: '照明',
        key: 'fault',
        value: 20,
        color: '#FFC700'
      },
      {
        name: '给排水',
        key: 'alarm',
        value: 10,
        color: '#F14545'
      },
      {
        name: '类型4',
        key: 'offline',
        value: 5,
        color: '#00ffff'
      },
      {
        name: '其他',
        key: 'offline',
        value: 5,
        color: '#ffffff'
      },
    ]
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
        type: '类型',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型',
        number: '121',
        Proportion: '12',
      }, {
        type: '类型',
        number: '121',
        Proportion: '12',
      },
    ])
    const chartEditStore = useChartEditStore()
    const deviceComponent = ref<CreateComponentType | null>()
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      deviceComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'device-type')
    }, { deep: true, immediate: true })

    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={deviceComponent.value?.title}>
          <div v-show={deviceComponent.value?.config.statusDistribution} class='ring-box'>
            <div class={deviceComponent.value?.config?.chartPosition}>
              <div class='chart' style={{ width: '180px', height: '160px' }}>
                <RingChart
                  pieData={deviceNumber}
                  seriesName='设备总数'
                  total={equipmentData.deviceNum}
                  unit='%'
                />
              </div>
              <div style={{ marginTop: '10px' }} class='grid-container'>
                {
                    deviceNumber.map(item =>
                      <div key={item.name} style='background:none' class='grid-item'>
                        <div class='title'>
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
          <div v-show={deviceComponent.value?.config.deviceStatusDetail}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
