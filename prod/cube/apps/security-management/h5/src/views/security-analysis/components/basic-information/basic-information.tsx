import { Cell, CellGroup, showNotify, Skeleton } from 'vant'
import { defineComponent, nextTick, ref, watch } from 'vue'
import styles from './basic-information.module.less'
import { getPeriodFormat } from '@/utils/timer-picker'
import { cubeAlarmCenterService, cubeSecurityManagementService } from '@/api/server'
import * as echarts from 'echarts'

interface Props {
  type: string;
}

/** 基本情况 */
export const BasicInformation = defineComponent({
  props: ['type'],
  setup: (props: Props) => {
    const loading = ref(true)
    const chartDom = ref()
    let chartInstance: echarts.ECharts | null = null
    const alarmNum = ref()
    const onlineNum = ref()
    const sameRatio = ref('')
    const alarmLevelList = ref<{
      name: string;
      value: number;
    }[]>([])

    const chartGenerate = (): void => {
      chartInstance && chartInstance.dispose()
      if (!chartDom.value) {
        return
      }
      chartDom.value && (chartInstance = echarts.init(chartDom.value))
      const option = {
        color: ['#FF4158', '#FE8704', '#8E3EFF', '#1D66FF'],
        series: [
          {
            type: 'pie',
            radius: ['75%', '90%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 2,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              normal: {
                show: true,
                position: 'center',
                color: '#4c4a4a',
                formatter: '{total|' + alarmNum.value + '}' + '\n\r' + '报警总数',
                rich: {
                  total: {
                    fontSize: 25,
                    color: '#454c5c'
                  },
                }
              },
              emphasis: { // 中间文字显示
                show: true,
              }
            },
            data: alarmLevelList.value
          }
        ]
      }
      chartInstance && chartInstance.setOption(option)
    }
    const getData = async (): Promise<void> => {
      loading.value = true
      const params = {
        type: props.type,
        period: '',
        applicationCode: __ENV__.applicationCode
      }
      params.period = getPeriodFormat(props.type)
      try {
        loading.value = true
        const { alarmNum: alarmNumRes, sameRatio: sameRatioRes } = await cubeAlarmCenterService.getAlarmStatisticsRingRatioAnalysis(params)
        alarmNum.value = alarmNumRes
        sameRatio.value = sameRatioRes ?? ''

        const { statusListVos } = await cubeSecurityManagementService.getStatusList(__ENV__.applicationCode)
        onlineNum.value = statusListVos.find(e => e.name === 'ONLINE')?.num ?? '--'
        const res = await cubeAlarmCenterService.getAlarmStatisticsLevel(params)
        alarmLevelList.value = res.map(e => {
          return {
            name: e.name,
            value: e.alarmNum,
          }
        })
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
      <CellGroup inset class={styles['basic-information']}>
        <Cell title='基本情况' />
        <Cell>
          <div class={styles['basic-information-cards']}>
            <div class={styles.item}>
              <Skeleton row={3} animated v-show={loading.value} />
              {
                !loading.value &&
                  <>
                    <span class={styles.title}>设备在线</span>
                    <div class={styles.value}>
                      {onlineNum.value}
                      <span class={styles.unit}>个</span>
                    </div>
                  </>
              }
            </div>
            <div class={styles.item} style='background: #FFF8F8'>
              <Skeleton row={3} animated v-show={loading.value} />
              {
                !loading.value &&
                  <>
                    <span class={styles.title}>设备报警</span>
                    <div class={styles.value}>
                      {alarmNum.value ?? '--'}<span class={styles.unit}>个</span>
                    </div>
                    <div class={styles.rate}>
                      <span>环比</span>
                      <span class={styles.rateValue}>{sameRatio.value ?? '--'}%</span>
                    </div>
                  </>
              }
            </div>
          </div>

          <div class={styles.chart}>
            <Skeleton row={4} v-show={loading.value} animated style='width: 100%;' />
            {
              !loading.value &&
                <>
                  <div class={styles.item} ref={chartDom} />
                  <div class={styles.item}>
                    {alarmLevelList.value.map(e => {
                      return (
                        <div class={styles['legend-item']} key={e.name}>
                          {e.name}报警
                          <span class={styles.value}>{e.value}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
            }
          </div>
        </Cell>
      </CellGroup>
  }
})
