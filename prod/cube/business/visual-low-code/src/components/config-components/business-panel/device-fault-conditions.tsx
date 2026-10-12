import { defineComponent, ref, watch, reactive } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import LightingRound from '@/components/common/business/lighting-round'
import FaultBox from '@/components/common/business/operation/fault-box'
import styles from './style/device-fault-conditions.module.less'
import { getComponentByType } from '@/utils'
import GridContainer from '@/components/common/business/grid-container'
import RollTable from '@/components/common/business/roll-table'
export default defineComponent({
  name: 'device-fault-conditions',
  props: ['style', 'item'],
  setup: (props) => {
    const roundData = reactive([
      {
        statistic: { title: '故障率', total: ' 67.44%' },
      }
    ])
    const faultData = ref([
      {
        color: '#2989FF',
        name: '设备数',
        value: 900
      },
      {
        color: '#FFC700',
        name: '故障数',
        value: 607
      },
    ])
    const deviceStatistic = ref([
      {
        alarmStatusName: '故障',
        alarmNum: 22,
        alarmStatus: '',
        color: '#FFC700',
      },
      {
        alarmStatusName: '故障率',
        alarmNum: '2.2%',
        alarmStatus: '',
        color: '#F14545',
      },
    ])
    const columns = ref([
      {
        title: '正常',
        dataIndex: 'normal',
      },
      {
        title: '故障',
        dataIndex: 'faultNum',
        width: '120',
      },
      {
        title: '故障率',
        dataIndex: 'faultRate',
      },

    ])
    const data = ref([
      {
        normal: '100',
        faultNum: '100',
        faultRate: '100%',
      },
      {
        normal: '130',
        faultNum: '12',
        faultRate: '12%',
      },
      {
        normal: '40',
        faultNum: '12',
        faultRate: '12%',
      },
      {
        normal: '40',
        faultNum: '13',
        faultRate: '13%',
      }
    ])
    const chartEditStore = useChartEditStore()
    const deviceFaultComponent = ref<CreateComponentType | null>()
    // 获取所有设备组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      deviceFaultComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'device-fault-conditions')
    }, { deep: true, immediate: true })
    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={deviceFaultComponent.value?.title}>
          <div v-show={deviceFaultComponent.value?.config?.isDeviceFault} style={{ marginTop: '10px' }}>
            <GridContainer data={deviceStatistic.value} />
          </div>
          <div v-show={deviceFaultComponent.value?.config?.isDeviceFaultDistribution} class={styles[`${deviceFaultComponent.value?.config.legendDirection}`]}>
            <LightingRound class={styles.LightingRoundBox} data={roundData} />
            <div class={styles['faultBox-right']}><FaultBox data={faultData.value} /></div>
          </div>
          <div v-show={deviceFaultComponent.value?.config?.isDeviceFaultItem}>
            <RollTable column={columns.value} data={data.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
