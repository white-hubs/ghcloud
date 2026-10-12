<template>
	<div :class="[props.eventNum ? 'pie-box1' : 'pie-box']">
		<div class="chart" ref="chartDom"></div>
		<div class="content">
			<slot></slot>
		</div>
	</div>
</template>
<script setup lang="ts">
import { withDefaults, onMounted, ref, watch, } from "vue";
import { render } from "./chart";

interface IData {
	value: number;
	label: string;
	color?: string;
}
interface Props {
	data: IData[];
	eventNum?: number;
}
const props = withDefaults(defineProps<Props>(), {});
const chartDom = ref();
watch(
	() => props.data,
	newVal => {
		render(chartDom.value, newVal);
	},
	{ deep: true }
);
onMounted(() => {
	render(chartDom.value, props.data);
});
</script>
<style scoped lang="less">
.pie-box {
	position: relative;
	width: 180px;
	height: 130px;

	&::after {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 50px;
		height: 50px;
		transform: translate(-50%, -50%);
		content: "";
		border-radius: 50%;
		background-color: rgba(0, 0, 0, 0.445);
	}

	&::before {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 80px;
		height: 80px;
		transform: translate(-50%, -50%);
		content: " ";
		border-radius: 50%;
		border: 1px dashed rgba(0, 0, 0, 0.245);
	}

	svg {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1;
	}
}

.pie-box1 {
	position: relative;
	width: 130px;
	height: 130px;


	&::before {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 80px;
		height: 80px;
		transform: translate(-50%, -50%);
		content: " ";
		border-radius: 50%;
		border: 1px dashed rgba(0, 0, 0, 0.245);
	}
}

.content {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 1;
	color: #fff;
	text-align: center;

	span {
		font-size: 18px;
		font-weight: bold;
	}
}

.chart {
	width: 100%;
	height: 100%;
}
</style>
