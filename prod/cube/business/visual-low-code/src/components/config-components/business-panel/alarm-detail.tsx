import { defineComponent, ref, watch } from 'vue'
import SubPanelTemplate from '@/components/common/business/sub-panel-template'
import '@/components/common/business/style/operate-days.less'
import RollTable from '@/components/common/business/roll-table.tsx'
import { useChartEditStore } from '@/store/modules/chart-edit-store/chart-edit-store'
import type { CreateComponentType } from '@/store/modules/chart-edit-store/chart-edit-store.d'
import { getComponentByType } from '@/utils'

export default defineComponent({
  name: 'alarm-detail',
  props: ['style', 'item'],
  setup: (props) => {
    const columns = ref([
      {
        title: '报警事件',
        dataIndex: 'event',
        width: '120',
      },
      {
        title: '报警时间',
        dataIndex: 'time',
      },
      {
        title: '处理情况',
        dataIndex: 'result',
      },
    ])
    const data = ref([
      {
        event: '1级',
        time: '121',
        result: '12',
      },
      {
        event: '2级',
        time: '121',
        result: '12',
      },
      {
        event: '3级',
        time: '121',
        result: '12',
      },
      {
        event: '4级',
        time: '121',
        result: '12',
      },
      {
        event: '5级',
        time: '121',
        result: '12',
      },
      {
        event: '6级',
        time: '121',
        result: '12',
      },
      {
        event: '7级',
        time: '121',
        result: '12',
      },
      {
        event: '8级',
        time: '121',
        result: '12',
      },
      {
        event: '9级',
        time: '121',
        result: '12',
      },
      {
        event: '10级',
        time: '121',
        result: '12',
      },
      {
        event: '11级',
        time: '121',
        result: '12',
      },
      {
        event: '12级',
        time: '121',
        result: '12',
      },
    ])
    const chartEditStore = useChartEditStore()
    const alarmComponent = ref<CreateComponentType | null>()
    const dataList = ref<{ event: string;time: string; result: string; }[] >([])
    // 获取所有报警组件
    watch(() => chartEditStore.getCurrentBlock, () => {
      alarmComponent.value = getComponentByType(chartEditStore.getCurrentPageComponents, props.item, 'alarm-detail')
      const showNumber = alarmComponent.value?.config.showNumber
      if (showNumber === '10') {
        dataList.value = data.value.slice(-10)
      } else {
        dataList.value = data.value.slice(-5)
      }
    }, { deep: true, immediate: true })
    return () => (
      <div style={{ ...props.style, background: 'rgba(0, 0, 0,0.5)' }}>
        <SubPanelTemplate title={alarmComponent.value?.title}>
          <div>
            <RollTable column={columns.value} data={dataList.value}> </RollTable>
          </div>
        </SubPanelTemplate>
      </div>
    )
  }
})
