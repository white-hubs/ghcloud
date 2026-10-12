<!--用点趋势-->
<template>
	<Bar :x-data="props.xData" :series="[{ name: props.name, data: props.data }]" />
</template>
<script setup lang="ts">
import Bar from "./charts/bar/bar.vue";
const props = defineProps<{
	xData: string[];
	name: string;
	data: number[];
}>()
</script>
<style scoped lang="less">
.title {
	font-size: 16px;
	font-weight: 400;
	color: #d0deee;
	margin-top: 24px;
}
</style>
