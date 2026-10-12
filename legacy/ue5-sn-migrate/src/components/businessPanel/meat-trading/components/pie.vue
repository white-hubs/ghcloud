<template>
  <div ref="powerFactorRef" class="power-factor" />
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts'
const powerFactorRef = ref();

const props = withDefaults(defineProps<{
  title: string;
  colorLsit: string[];
  data: any[];
  xData: string[] | undefined;
  unit?: string;
}>(), {
  title: '',
  data: () => [],
  xData: () => [],
  colorLsit: () => ["rgba(41,137,255,0)", "#2989FF"],
  unit: ''
});
const render = () => {
  const option: any  = {
    tooltip: {
        trigger: 'item',
        formatter: function (param) {
              return param.name+':'+param.value
            },
        position(point, params, dom, rect, size) {
          var obj = {top: 60};
      obj[['left', 'right'][+(point[0] < size.viewSize[0] / 2)]] = 5;
      return obj;

        }
    },
    legend: {
        x: 'center',
        y: 'bottom',
        data: ['rose3', 'rose5', 'rose6', 'rose7', 'rose8']
    },
    calculable: true,
    series: props.data
};
  const myChart = echarts.init(powerFactorRef.value)
  option && myChart.setOption(option)
};
watch(
  () => props.xData,
  () => {
    render();
  }
);
watch(
  () => [...props.data],
  () => {
    render();
  }
);

onMounted(() => {
  render()
});
</script>
<style lang="less" scoped>
#load-chart,
.power-factor {
  width: 100%;
  height: 100%;
}
</style>
