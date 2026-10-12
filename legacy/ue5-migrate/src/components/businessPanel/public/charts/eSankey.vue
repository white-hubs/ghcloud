
<template>
  <div id="sankey" ref="sankey" style="width:100%;height:100%" />
</template>
<script lang="ts">
import { onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { EChartsOption } from 'echarts'

interface Props {
  nodes: any;
  links: echarts.SankeySeriesOption[] | undefined;
}
</script>
<script setup lang="ts">
const sankey = ref()
const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  links: () => []
})

const render = () => {
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
);
onMounted(() => {
  render()
})

defineExpose({
  render
})
</script>
<style lang="less" scoped></style>
