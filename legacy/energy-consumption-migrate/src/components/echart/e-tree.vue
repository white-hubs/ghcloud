<template>
  <div id="tree" ref="tree" />
</template>
<script setup lang="ts">
import * as echarts from "echarts";
import { type EChartsOption } from "echarts";
import { onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
  treeData: any;
}
const tree = ref();
let myChart: any = null;
let resizeObserver: ResizeObserver | null = null;
const emit = defineEmits(["clickSeries"]);
const props = withDefaults(defineProps<Props>(), {
  treeData: [],
});

const wrapNodeLabel = (value?: string) => {
  if (!value) return "";
  const characters = Array.from(value);
  const maxCharactersPerLine = 22;
  const lines: string[] = [];

  for (let index = 0; index < characters.length; index += maxCharactersPerLine) {
    lines.push(characters.slice(index, index + maxCharactersPerLine).join(""));
  }

  return lines.join("\n");
};

const formatNodeLabel = (data: any) => {
  const deviceName = wrapNodeLabel(data.deviceName);
  const code = wrapNodeLabel(data.code ? String(data.code) : "");
  const fallback = typeof data.label?.formatter === "string" ? data.label.formatter : "";

  return [deviceName || fallback, code].filter(Boolean).join("\n");
};

const render = () => {
  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
    },
    series: series.value,
  };
  myChart = echarts.init(tree.value);
  option && myChart.setOption(option, true);
  myChart.on("click", function (params: { componentType: string; data: any }) {
    if (params.componentType === "series") {
      emit("clickSeries", params.data);
    }
  });
};
onMounted(() => {
  render();
  const container = tree.value?.parentElement;
  if (container) {
    resizeObserver = new ResizeObserver(() => myChart?.resize());
    resizeObserver.observe(container);
  }
});
const series = ref<any[]>([]);
watch(
  () => props.treeData,
  () => {
    const dom = document.getElementById("tree");
    series.value = [];
    props.treeData.forEach((item: any, index: number) => {
      series.value.push({
        type: "tree",
        data: [item],
        symbolSize: 9,
        height: `${100 / props.treeData.length}%`,
        top: `${(100 / props.treeData.length) * index}%`,
        bottom: "1%",
        left: "5%",
        right: "52%",
        label: {
          position: "right",
          verticalAlign: "middle",
          align: "left",
          fontSize: 12,
          lineHeight: 18,
          formatter: (params: any) => formatNodeLabel(params.data),
        },
        tooltip: {
          formatter: (params: any) => {
            const { deviceName, code } = params.data ?? {};
            return deviceName ? [deviceName, code].filter(Boolean).join("<br />") : params.name;
          },
        },
        edgeShape: "polyline",
        edgeForkPosition: "35%",
        expandAndCollapse: false,
        animationDuration: 550,
        animationDurationUpdate: 750,
      });
    });
    render();
    const nodes = myChart?._chartsViews[0]?._data?._graphicEls;
    let allNode = 0;
    for (var i = 0, count = nodes.length; i < count; i++) {
      const node = nodes[i];
      if (node === undefined) continue;
      allNode++;
    }
    const minimumTreeHeight = 240;
    const currentHeight = 60 * allNode;
    const newHeight = Math.max(currentHeight, minimumTreeHeight);
    dom.style.height = newHeight + "px";
    myChart.resize();
  },
);
const clear = () => {
  if (myChart) {
    myChart.clear();
    echarts.dispose(myChart);
  }
};
onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  clear();
});
defineExpose({
  clear,
  render,
});
</script>
<style lang="less" scoped>
#tree {
  width: 100%;
  height: 100vh;
}
</style>
