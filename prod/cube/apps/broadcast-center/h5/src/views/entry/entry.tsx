import { defineComponent, nextTick, onMounted, ref } from 'vue'
import styles from './entry.module.less'
import { Cell, CellGroup, Skeleton, showNotify } from 'vant'
import { cubeSecurityManagementService } from '@/api/server'
import type { DeviceStatus } from '@ghcloud/cube-security-management-service'
import * as echarts from 'echarts/core'
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'
import { CubeNavBar, EntryMenu } from '@ghcloud/cube-app-generic-component'
import { routes } from '@/router'
echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  LabelLayout,
  GridComponent
])

/** 入口页面 */
export const Entry = defineComponent({
  name: 'Entry',
  setup: () => {
    const loading = ref(false)
    const deviceStatus = ref<DeviceStatus>()
    const getData = async (): Promise<void> => {
      try {
        loading.value = true
        deviceStatus.value = await cubeSecurityManagementService.getStatusList(__ENV__.applicationCode)
        const echartData = deviceStatus.value.statusListVos.map(e => {
          return {
            name: e.name === 'OFFLINE' ? '离线' : '在线',
            value: e.num
          }
        })
        const option = {
          grid: { // 让图表占满容器
            top: '0px',
            left: '0px',
            right: '0px',
            bottom: '0px'
          },
          series: [
            {
              type: 'pie',
              radius: ['80%', '95%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 40,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: echartData
            }
          ]
        }
        const chartDom = document.getElementById('chartDom')
        if (chartDom) {
          nextTick(() => {
            const myChart = echarts.init(chartDom)
            myChart.setOption(option)
          })
        }
      } catch {
        showNotify({ message: '获取数据失败', type: 'danger' })
      } finally {
        loading.value = false
      }
    }
    onMounted(() => {
      getData()
    })

    return (): JSX.Element =>
      <>
        <CubeNavBar showBack title='广播中心' />
        <div class={styles.container}>
          <EntryMenu applicationCode={__ENV__.applicationCode} routes={routes} title='应用' />
          <CellGroup inset class={styles['app-group']}>
            <Cell title='广播概览' />
            <Cell>
              <div class={styles['chart-box']} v-show={!loading.value}>
                <div class={styles['chart-box-item']} id='chartDom' />
                <div class={styles['device-count-text']}>
                  <span style='color:black;font-size:4vw'>{deviceStatus.value ? deviceStatus.value.total : '--'}</span>
                  设备总数
                </div>
                <div class={styles['chart-box-item']}>
                  <div class={styles['online-box']}>
                    <span>在线</span>
                    <span class={styles['device-num']}>{deviceStatus.value ? deviceStatus.value.statusListVos.find(e => e.name === 'ONLINE')?.num : '--'}</span>
                  </div>
                  <div class={styles['offline-box']}>
                    <span>离线</span>
                    <span class={styles['device-num']}>{deviceStatus.value ? deviceStatus.value.statusListVos.find(e => e.name === 'OFFLINE')?.num : '--'}</span>
                  </div>
                </div>
              </div>
              <Skeleton row={5} animated v-show={loading.value} />
            </Cell>
          </CellGroup>
        </div>
      </>
  }
})
