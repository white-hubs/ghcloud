<template>
  <div class="box">
    <div class="chart" ref="chartDom"></div>
    <p v-if="title" class="title">{{ title }}</p>
  </div>
</template>
<script lang="ts" setup>
import { withDefaults, ref, onMounted, onBeforeUnmount, watch, onUnmounted } from "vue";
import { render } from "./chart";
interface Props {
  value: number;
  title?: string | null;
  color?: string;
}
const props = withDefaults(defineProps<Props>(), {
  value: 50,
  title: null,
  color: "#2989FF",
});
const chartDom = ref();
const timer: any = ref(null);
watch(
  () => props.value,
  (newVal) => {
    window.clearInterval(timer.value);
    setTimeout(() => {
      timer.value = render(chartDom.value, newVal, props.color);
    }, 200);
  }
);
onMounted(() => {
  timer.value = render(chartDom.value, props.value, props.color);
});
onUnmounted(() => {
  clearInterval(timer.value);
  timer.value = null;
});
</script>
<style lang="less" scoped>
.box {
  display: inline-block;
}

.chart {
  width: 100px !important;
  height: 100px !important;
}

.title {
  text-align: center;
  margin-top: 8px;
  margin-bottom: 0px;
  font-size: 14px;
  font-weight: 400;
  color: #ffffff;
}
</style>
