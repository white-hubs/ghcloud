<template>
	<div class="chart" ref="chartDom"></div>
</template>
<script lang="ts" setup>
import {  ref, onMounted,watch } from "vue";
import { render } from "./chart";

interface Props {
	titles?: string[];
	data: number[];
	maxData: number[];
	lineColor?:string;
	dataColor?:string;
}
const props = withDefaults(defineProps<Props>(), {
	titles: () => [],
});

const chartDom = ref();

onMounted(() => {
	render(chartDom.value, props.titles, props.data, props.maxData,props.lineColor,props.dataColor);
});
watch(() => [...props.data],
  newVal => {
    render(chartDom.value, props.titles, props.data, props.maxData,props.lineColor,props.dataColor);
  })
</script>
<style lang="less" scoped>
.chart {
	width: 100%;
	min-height: 260px;
}
</style>
