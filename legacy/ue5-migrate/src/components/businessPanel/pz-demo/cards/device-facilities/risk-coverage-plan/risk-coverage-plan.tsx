import { defineComponent, ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { use } from 'echarts/core'
import { GraphChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent
} from 'echarts/components'
import { calcFontSize } from '@/utils/common'
import SubPanelTemplate from "@/components/businessPanel/public/subPanelTemplate.vue"
import { PZService } from '../../../card-service/service'

use([
  GraphChart,
  TitleComponent,
  TooltipComponent
])

export const RiskCoveragePlan = defineComponent({
  setup () {
    // 图表实例
    let chartInstance = null
    const chartRef = ref(null)
    const nodesColors = ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#14B8A6']
    // 流程图数据
    const flowData = {
      nodes: [
        {
          name: '设备信息采集',
          value: 0,
          itemStyle: { color: '#3B82F6' },
          symbol: 'circle',
          symbolSize: 70
        },
        {
          name: '风险评估',
          value: 1,
          itemStyle: { color: '#F59E0B' },
          symbol: 'circle',
          symbolSize: 70
        },
        {
          name: '制定保养计划',
          value: 2,
          itemStyle: { color: '#10B981' },
          symbol: 'circle',
          symbolSize: 70
        },
        {
          name: '计划审核',
          value: 3,
          itemStyle: { color: '#8B5CF6' },
          symbol: 'circle',
          symbolSize: 70
        },
        {
          name: '计划执行',
          value: 4,
          itemStyle: { color: '#EC4899' },
          symbol: 'circle',
          symbolSize: 70
        },
        {
          name: '效果评估',
          value: 5,
          itemStyle: { color: '#14B8A6' },
          symbol: 'circle',
          symbolSize: 70
        }
      ],
      links: [
        {
          source: 0,
          target: 1,
          lineStyle: { color: '#3B82F6' },
          label: { show: true, formatter: '收集基础信息' }
        },
        {
          source: 1,
          target: 2,
          lineStyle: { color: '#F59E0B' },
          label: { show: true, formatter: '评估风险等级' }
        },
        {
          source: 2,
          target: 3,
          lineStyle: { color: '#10B981' },
          label: { show: true, formatter: '制定保养方案' }
        },
        {
          source: 3,
          target: 4,
          lineStyle: { color: '#8B5CF6' },
          label: { show: true, formatter: '审核通过' }
        },
        {
          source: 4,
          target: 5,
          lineStyle: { color: '#EC4899' },
          label: { show: true, formatter: '执行保养计划' }
        }
      ]
    }
    const getData = async (): Promise<void>=>{
      const result = await PZService.device.getDeviceMaintenancePlanCustomization({
        type: '',
        period: ''
      })
      flowData.nodes = result.map((item, index)=>{
        return {
          name: item.name,
          value: item.sort,
          itemStyle: { color: nodesColors[index] },
          symbol: 'circle',
          symbolSize: 70
        }
      })
      flowData.links = generateLinksFromNodes(flowData.nodes)
      initChart()
    }
    const generateLinksFromNodes = (nodes: {
      name: string;
      value: number;
      itemStyle: {
        color: string;
      };
      symbol: string;
      symbolSize: number;
    }[]): {
      source: number;
      target: number;
      lineStyle: {
        color: string;
      };
      label: {
        show: boolean;
        formatter: string;
      };
    }[]=> {
      // 检查 nodes 数组的长度
      if (nodes.length < 2) {
        return []; // 如果 nodes 数组为空或只有一个节点，返回空的 links 数组
      }

      const links = [];

      // 遍历 nodes 数组，生成 links
      for (let i = 0; i < nodes.length - 1; i++) {
        // 当前节点的下标
        const sourceIndex = i;
        // 下一个节点的下标
        const targetIndex = i + 1;

        // 检查 targetIndex 是否超出数组范围
        if (targetIndex >= nodes.length) {
          break; // 如果超出范围，退出循环
        }

        // 创建 link 对象
        const link = {
          source: sourceIndex,
          target: targetIndex,
          lineStyle: { color: nodes[sourceIndex].itemStyle.color }, // 使用 source 节点的颜色
          label: {
            show: true,
            formatter: nodes[sourceIndex].name
          }
        };

        // 将 link 添加到 links 数组
        links.push(link);
      }

      return links;
    }
    // 初始化图表
    const initChart = (): void => {
      if (!chartRef.value) return

      chartInstance = echarts.init(chartRef.value)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: (params): string => {
            if (params.dataType === 'node') {
              return `<div style="padding: 8px">
                <div style="font-weight: bold">${params.name}</div>
              </div>`
              // return `<div style="padding: 8px">
              //   <div style="font-weight: bold">${params.name}</div>
              //   <div style="margin-top: 5px">点击查看详情</div>
              // </div>`
            }
            return params.data.label.formatter
          }
        },
        series: [
          {
            type: 'graph',
            layout: 'circular',
            roam: false,
            label: {
              show: true,
              position: 'inside',
              color: '#ffffff',
              fontSize: calcFontSize(12),
              fontWeight: 'bold'
            },
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 12],
            edgeLabel: {
              show: true,
              fontSize: calcFontSize(12),
              color: '#ffffff',
              distance: 20
            },
            data: flowData.nodes,
            links: flowData.links,
            lineStyle: {
              opacity: 0.9,
              width: 2,
              curveness: 0.2
            },
            emphasis: {
              focus: 'adjacency',
              lineStyle: {
                width: 4
              }
            },
            animation: true,
            animationDuration: 1500,
            animationEasing: 'cubicOut'
          }
        ]
      }
      chartInstance.setOption(option)
    }

    onMounted(() => {
      initChart()
      getData()
      window.addEventListener('resize', () => {
        chartInstance?.resize()
      })
    })

    return (): JSX.Element => (
      <SubPanelTemplate title="设备保养计划流程">
        <div class='card-container-2' ref={chartRef}></div>
      </SubPanelTemplate>
    )
  }
})