import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart } from 'echarts/charts'
import {
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import DateInlineForm from "@/components/businessPanel/public/dateInlineForm.vue";
import { getAreaList } from '@/api/mdata'
import styles from './energy-consumption-index-overview.module.less'
import { PZService } from '../../../card-service/service'

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  MarkPointComponent,
  MarkLineComponent
])

export const EnergyConsumptionIndexOverview = defineComponent({
  setup () {
    let chartInstance = null
    const chartRef = ref<HTMLElement | null>(null)
    const area = ref({
      areaType: '', // 默认选中区域1
    })
    const areaList = ref([])
    // 请替换为真实数据
    const seriesData = [
      {
        name: '水',
        type: 'bar',
        data: [0, 0, 0], // 调整数据结构
        itemStyle: {
          color: '#5470c6'
        },
        barWidth: '20%'
      },
      {
        name: '电',
        type: 'bar',
        data: [0, 0, 0], // 调整数据结构
        itemStyle: {
          color: '#91cc75'
        },
        barWidth: '20%'
      },
      {
        name: '气',
        type: 'bar',
        data: [0, 0, 0], // 调整数据结构
        itemStyle: {
          color: '#fac858'
        },
        barWidth: '20%'
      }
    ]
    const getData = async (): Promise<void> => {
      const res = await PZService.energy.getEnergyIndexOverview(area.value.areaType)
      seriesData.length = 0
      res.forEach((item, index) => {
        let data = [0, 0, 0]
        let color = '#5470c6'
        if (index === 0){
          data = [item.count, 0, 0]
        } else if (index === 1){
          data = [0, item.count, 0]
          color = '#91cc75'
        } else if (index === 2){
          data = [0, 0, item.count]
          color = '#fac858'
        }
        seriesData.push(
          {
            name: item.type,
            type: 'bar',
            data: data,
            itemStyle: {
              color: color
            },
            barWidth: '20%'
          }
        )
      })
      chartResize()
    }

    const initChart = (el: HTMLElement): void => {
      chartInstance = echarts.init(el)
      chartInstance.setOption({
        tooltip: {
          // 修改 trigger 为 item
          trigger: 'item',
          axisPointer: {
            type: 'shadow'
          },
          textStyle: {
            fontSize: calcFontSize(12),
          }
        },
        legend: {
          data: ['水', '电', '气'],
          right: 0,
          top: 0,
          textStyle: {
            fontSize: calcFontSize(12),
            color: '#ffffff'
          }
        },
        grid: {
          left: calcFontSize(40),
          right: calcFontSize(0),
          top: calcFontSize(50),
          bottom: calcFontSize(30)
        },
        xAxis: {
          axisLine: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          axisTick: {
            lineStyle: {
              color: '#ffffff'
            }
          },
          type: 'category',
          data: seriesData.map(item => item.name),
          name: '',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        yAxis: {
          type: 'value',
          name: '能耗总量',
          axisLabel: {
            interval: 0,
            color: '#ffffff',
            fontSize: calcFontSize(12)
          },
          nameTextStyle: {
            color: '#ffffff',
            fontSize: calcFontSize(12)
          }
        },
        series: seriesData
      })
    }

    const chartResize = (): void => {
      chartInstance && chartInstance.dispose()
      setTimeout(() => {
        chartRef.value && initChart(chartRef.value as HTMLElement)
      }, 1000);
    }

    onMounted(async () => {
      await getAreaList().then(res=>{
        areaList.value = res.map(item=>{
          return {
            value: item.id,
            label: item.name
          }
        })
        area.value.areaType = areaList.value[0].value
      })
      getData()
      window.addEventListener('resize', chartResize)
    })

    onUnmounted(() => {
      chartInstance && chartInstance.dispose()
      window.removeEventListener('resize', chartResize)
    })

    watch(() => area.value.areaType, () => {
      chartResize()
    })

    return (): JSX.Element => (
      <SubPanelTemplate class={styles.areaPicker} v-slots={{
        extra: () => (
          areaList.value.length > 0 && <DateInlineForm
            v-model:modelValue={area.value}
            timeList={areaList.value}>
          </DateInlineForm>
        )
      }}>
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})