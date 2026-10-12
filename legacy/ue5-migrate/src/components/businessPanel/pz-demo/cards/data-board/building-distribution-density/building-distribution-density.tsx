import { defineComponent, ref, onMounted, onUnmounted } from 'vue'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue";
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { HeatmapChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent
} from 'echarts/components'
import styles from './building-distribution-density.module.less'

use([
  HeatmapChart,
  TitleComponent,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent
])

// 在组件顶部引入成都地图数据
import { registerMap } from 'echarts'
import chengduJson from '@/assets/map/chengdu.json'

export const BuildingDistributionDensity = defineComponent({
  name: 'BuildingDistributionDensity',
  setup () {
    let chartInstance = null
    const chartRef = ref(null)

    // 建筑数据 - 基于提供的表格数据
    // 调整建筑数据坐标为成都坐标系
    const buildingData = [
      { id: 1, lng: 104.0658, lat: 30.6570, type: '商业', floors: 25, desc: '天府广场写字楼' },
      { id: 2, lng: 104.0665, lat: 30.6575, type: '商业', floors: 30, desc: '春熙路商圈购物中心' },
      { id: 3, lng: 104.0650, lat: 30.6565, type: '住宅', floors: 18, desc: '老城区改造公寓' },
      { id: 4, lng: 116.3163, lat: 39.9834, type: '商业', floors: 12, desc: '中关村科技园办公楼' },
      { id: 5, lng: 116.3170, lat: 39.9840, type: '商业', floors: 8, desc: '中关村创业孵化器' },
      { id: 6, lng: 116.4623, lat: 39.9096, type: '商业', floors: 40, desc: '国贸CBD超高层地标' },
      { id: 7, lng: 116.4630, lat: 39.9100, type: '住宅', floors: 35, desc: '国贸周边高端住宅' },
      { id: 8, lng: 116.6563, lat: 39.9136, type: '工业', floors: 5, desc: '通州物流仓库' },
      { id: 9, lng: 116.5035, lat: 39.7958, type: '住宅', floors: 6, desc: '亦庄开发区员工宿舍' },
      { id: 10, lng: 116.4000, lat: 39.9085, type: '公共设施', floors: 3, desc: '市中心社区服务中心' }
    ]

    // 转换为热力图数据格式
    const heatmapData = buildingData.map(item => {
      // 使用楼层数作为权重，楼层越高，密度越大
      return [item.lng, item.lat, item.floors]
    })

    // 不同建筑类型的统计
    const typeCount = {
      '商业': buildingData.filter(item => item.type === '商业').length,
      '住宅': buildingData.filter(item => item.type === '住宅').length,
      '工业': buildingData.filter(item => item.type === '工业').length,
      '公共设施': buildingData.filter(item => item.type === '公共设施').length
    }

    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)

      const option = {
        tooltip: {
          trigger: 'item',
          formatter: function (params): string {
            if (params.componentSubType === 'heatmap') {
              const building = buildingData.find(item =>
                item.lng === params.data[0] && item.lat === params.data[1])
              if (building) {
                return `
                  <div>类型：${building.type}</div>
                  <div>楼层：${building.floors}</div>
                  <div>说明：${building.desc}</div>
                `
              }
            }
            return ''
          }
        },
        visualMap: {
          min: 0,
          max: 40,
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: '5%',
          text: ['高', '低'],
          dimension: 2,
          inRange: {
            color: ['#1a237e', '#303f9f', '#3f51b5', '#7986cb', '#c5cae9']
          },
          textStyle: {
            color: '#fff'
          }
        },
        series: [
          {
            name: '建筑密度',
            type: 'heatmap',
            coordinateSystem: 'geo',
            data: heatmapData,
            pointSize: 8,
            blurSize: 12
          }
        ],
        geo: {
          map: 'chengdu',
          roam: true,
          center: [104.06, 30.67],
          zoom: 12,
          itemStyle: {
            areaColor: '#1a1a1a',
            borderColor: '#2a2a2a'
          },
          emphasis: {
            itemStyle: {
              areaColor: '#252525'
            }
          },
          silent: false,
          label: {
            show: false
          }
        }
      }

      chartInstance.setOption(option)
    }

    const handleResize = (): void => {
      chartInstance?.resize()
    }

    onMounted(() => {
      // 注册成都地图
      registerMap('chengdu', chengduJson)
      initChart()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      chartInstance?.dispose()
      window.removeEventListener('resize', handleResize)
    })

    return (): JSX.Element => (
      <SubPanelTemplate title='建筑分布密度分析'>
        <div class='card-container-4'>
          <div class={styles.container}>
            <div class={styles['building-stats']}>
              <div class={styles['stat-item']}>
                <div class={styles['stat-value']}>{buildingData.length}</div>
                <div class={styles['stat-label']}>总数</div>
              </div>
              <div class={styles['stat-item']}>
                <div class={styles['stat-value']}>{typeCount['商业']}</div>
                <div class={styles['stat-label']}>商业</div>
              </div>
              <div class={styles['stat-item']}>
                <div class={styles['stat-value']}>{typeCount['住宅']}</div>
                <div class={styles['stat-label']}>住宅</div>
              </div>
              <div class={styles['stat-item']}>
                <div class={styles['stat-value']}>{typeCount['工业'] + typeCount['公共设施']}</div>
                <div class={styles['stat-label']}>其他</div>
              </div>
            </div>
            <div ref={chartRef} style={{ width: '100%', height: 'calc(100% - 60px)' }}></div>
          </div>
        </div>
      </SubPanelTemplate>
    )
  }
})