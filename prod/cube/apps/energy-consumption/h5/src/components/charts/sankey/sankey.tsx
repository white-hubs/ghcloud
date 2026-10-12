import { defineComponent, ref, type PropType, onMounted, watch } from 'vue'
import * as echarts from 'echarts/core'
import type { EChartsOption } from 'echarts/types/dist/shared'
import type { Data, Link } from '@ghcloud/cube-energy-consumption-service/src/energy-management.service'

export default defineComponent({
  name: 'Sankey',
  props: {
    nodes: {
      type: Array as PropType<Data[]>,
      default: []
    },
    links: {
      type: Array as PropType<Link[]>,
      default: []
    },
  },
  setup: (props) => {
    const sankey = ref()
    const render = (): void => {
      const option: EChartsOption = {
        title: {},
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        series: [
          {
            type: 'sankey',
            data: props.nodes,
            links: props.links,
            emphasis: {
              focus: 'adjacency'
            },
            levels: [
              {
                depth: 0,
                itemStyle: {
                  color: '#fbb4ae'
                },
                lineStyle: {
                  color: 'source',
                  opacity: 0.6
                }
              },
              {
                depth: 1,
                itemStyle: {
                  color: '#b3cde3'
                },
                lineStyle: {
                  color: 'source',
                  opacity: 0.6
                }
              },
              {
                depth: 2,
                itemStyle: {
                  color: '#ccebc5'
                },
                lineStyle: {
                  color: 'source',
                  opacity: 0.6
                }
              },
              {
                depth: 3,
                itemStyle: {
                  color: '#decbe4'
                },
                lineStyle: {
                  color: 'source',
                  opacity: 0.6
                }
              }
            ],
            lineStyle: {
              curveness: 0.5
            }
          }
        ]
      }
      const myChart = echarts.init(sankey.value)
      option && myChart.setOption(option)
    }
    watch(
      () => [...props.links],
      () => {
        render()
      }, { deep: true }
    )
    onMounted(() => {
      render()
    })
    return () => {
      return (
        <div id='sankey' ref={sankey} style='height:300px;width:90vw' />
      )
    }
  }
})
