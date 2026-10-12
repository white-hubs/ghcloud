import { Cell, CellGroup, Empty, showNotify, Skeleton } from 'vant'
import { defineComponent, nextTick, ref, watch } from 'vue'
import styles from './patrol-abnormality.module.less'
import { getPeriodFormat } from '@/utils/timer-picker'
import { cubeSecurityManagementService } from '@/api/server'
import * as echarts from 'echarts'

interface Props {
  type: string;
}

/** 巡逻异常情况 */
export const PatrolAbnormality = defineComponent({
  props: ['type'],
  setup: (props: Props) => {
    const loading = ref(true)
    const chartDom = ref()
    let chartInstance: echarts.ECharts | null = null
    const cameraPatrolLineAbnormalStatistics = ref<{
      id: string;
      name: string;
      totalNum: number;
    }[]>([])

    const chartGenerate = (): void => {
      chartInstance && chartInstance.dispose()
      if (!chartDom.value) {
        return
      }
      chartDom.value && (chartInstance = echarts.init(chartDom.value))
      const option = {
        grid: {
          top: 5,
          bottom: 30,
          left: 30,
          right: 0
        },
        xAxis: {
          type: 'category',
          data: cameraPatrolLineAbnormalStatistics.value.map(e => e.name)
        },
        yAxis: {
          type: 'value'
        },
        series: [
          {
            data: cameraPatrolLineAbnormalStatistics.value.map(e => e.totalNum),
            type: 'bar'
          }
        ]
      }
      chartInstance && chartInstance.setOption(option)
    }
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        const period = getPeriodFormat(props.type)
        const { cameraPatrolLineAbnormalStatisticsVOS } = await cubeSecurityManagementService.getCameraPatrolAbnormalStatistics(period)
        cameraPatrolLineAbnormalStatistics.value = cameraPatrolLineAbnormalStatisticsVOS
        loading.value = false
        nextTick(() => {
          chartGenerate()
        })
      } catch {
        showNotify('获取数据失败')
      } finally {
        loading.value = false
      }
    }

    watch(() => props.type, () => {
      getData()
    }, { immediate: true })

    return (): JSX.Element =>
      <CellGroup inset class={styles['patrol-abnormality']}>
        <Cell title='巡逻异常情况' />
        <Cell>
          <Skeleton row={6} animated v-show={loading.value} />
          {
            cameraPatrolLineAbnormalStatistics.value.length === 0 && <Empty description='暂无数据' />
          }
          {
            cameraPatrolLineAbnormalStatistics.value.length > 0 && <div class={styles.chart} ref={chartDom} />
          }
        </Cell>
      </CellGroup>
  }
})
