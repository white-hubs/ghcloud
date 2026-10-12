<template>
	<div class="radar-box">
		<div class="radar" ref="scanRadar"></div>
		<span class="value">{{ value }}</span>
	</div>
</template>
<script setup lang="ts">
import { withDefaults, ref, onMounted } from "vue";
import { render } from "./chart";
interface Props {
	value: number; //设备健康度 数值
}
const props = withDefaults(defineProps<Props>(), {
	value: 0,
});
const scanRadar = ref();
onMounted(() => {
	render(scanRadar.value);
});
</script>
<style lang="less" scoped>
.radar-box {
	width: 120px;
	height: 120px;
	position: relative;
	.value {
		font-size: 33px;
		font-weight: 400;
		color: #ffffff;
		position: absolute;
		left: 49%;
		top: 48%;
		transform: translate(-50%, -50%);
		&::after {
			content: "分";
			color: #ffffff;
			position: absolute;
			bottom: 10px;
			right: -15px;
			font-size: 12px;
		}
		&::before {
			content: "设备健康度";
			color: #ffffff;
			position: absolute;
			bottom: -5px;
			left: 50%;
			transform: translateX(-50%);
			white-space: nowrap;
			font-size: 12px;
		}
	}
}
.radar {
	width: 118px;
	height: 118px;
	position: absolute;
	left: 50%;
	top: 50%;
	transform: translate(-50%, -50%);
}
.radar:after {
	content: " ";
	display: block;
	background-image: linear-gradient(44deg, rgba(0, 255, 51, 0) 15%, rgba(41, 137, 255, 1) 100%);
	width: 58px;
	height: 58px;
	position: absolute;
	top: 0;
	left: 0;
	animation: radar-beam 4s infinite;
	animation-timing-function: linear;
	transform-origin: bottom right;
	border-radius: 100% 0 0 0;
}
@keyframes radar-beam {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}
</style>
