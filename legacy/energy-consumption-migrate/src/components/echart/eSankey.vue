<template>
  <div ref="sankey" :style="{ width: '100%', height: chartHeight }" />
</template>
<script setup lang="ts">
import * as echarts from "echarts";
import { type EChartsOption } from "echarts";
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
interface Props {
  nodes: any[];
  links: any[];
}
const sankey = ref<HTMLDivElement>();
const props = withDefaults(defineProps<Props>(), {
  nodes: () => [],
  links: () => [],
});

const MIN_CHART_HEIGHT = 400;
const NODE_ROW_HEIGHT = 28;
const CHART_VERTICAL_PADDING = 40;
const chartHeight = computed(() => `${Math.max(MIN_CHART_HEIGHT, props.nodes.length * NODE_ROW_HEIGHT + CHART_VERTICAL_PADDING)}px`);

let myChart: echarts.ECharts | null = null;
const render = () => {
  if (!sankey.value) return;

  const option: EChartsOption = {
    title: {},
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: [
      {
        type: "sankey",
        data: props.nodes,
        nodeGap: 20,
        links: props.links,
        emphasis: {
          focus: "adjacency",
        },
        levels: [
          {
            depth: 0,
            itemStyle: {
              color: "#fbb4ae",
            },
            lineStyle: {
              color: "source",
              opacity: 0.6,
            },
          },
          {
            depth: 1,
            itemStyle: {
              color: "#b3cde3",
            },
            lineStyle: {
              color: "source",
              opacity: 0.6,
            },
          },
          {
            depth: 2,
            itemStyle: {
              color: "#ccebc5",
            },
            lineStyle: {
              color: "source",
              opacity: 0.6,
            },
          },
          {
            depth: 3,
            itemStyle: {
              color: "#decbe4",
            },
            lineStyle: {
              color: "source",
              opacity: 0.6,
            },
          },
        ],
        lineStyle: {
          curveness: 0.5,
        },
      },
    ],
  };

  myChart ??= echarts.init(sankey.value);
  myChart.setOption(option, true);
  myChart.resize();
};

onMounted(() => {
  render();
});

watch(
  () => [props.nodes, props.links],
  async () => {
    await nextTick();
    render();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  myChart?.dispose();
  myChart = null;
});

defineExpose({
  render,
});
</script>
<style lang="less" scoped></style>
