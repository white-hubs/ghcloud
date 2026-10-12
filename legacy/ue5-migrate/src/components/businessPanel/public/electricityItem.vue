<template>
	<div class="electricityItem">
		<div class="top">
			<div class="title">{{ title }}</div>
			<div class="right">
				<div class="count">
					<count-to :startVal="0" :endVal="value" :duration="4000" class="scroll-number"></count-to>
					<span class="unit">kw/h</span>
				</div>
				<div class="mode">环比</div>
				<div :class="['downtriangle']"></div>
				<div :class="['up']">{{radio}}%</div>
			</div>
		</div>
		<div class="line">
			<div class="animation"></div>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { CountTo } from "vue3-count-to";
import { withDefaults } from "vue";
interface Props {
	title: string;
	barColor?: string;
  	animationDelay?:string,
	value?:number,
	radio?:number
}
const props = withDefaults(defineProps<Props>(), {
	title: "",
	barColor: "#ffc700",
  	animationDelay:'0',
	value:0,
	radio:0
});
</script>
<style lang="less">
.electricityItem {
	.top {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		.title {
			color: #d0deee;
			font-size: 14px;
		}
		.right {
			display: flex;
			align-items: flex-end;
			.count {
				color: #d0deee;
				display: flex;
				align-items: flex-end;
				font-size: 20px;
				line-height: 27px;
				.unit {
					font-size: 12px;
					margin-left: 6px;
					
				}
			}
			.mode {
      	color: #d9e7ff;
				font-size: 12px;
				margin-right: 3px;
				margin-left: 7px;
			}
			.downtriangle {
				width: 0;
				height: 0;
				border-left: 8px solid transparent;
				border-right: 8px solid transparent;
				border-bottom: 8px solid #2ae8bd;
				margin-right: 3px;
				transform: rotate(180deg);
				margin-bottom: 4px;
			}
			.up {
				color: #2ae8bd;
				margin-top: 3px;
				line-height: 19px;
			}
			.down {
				color: #f14545;
				margin-top: 3px;
				line-height: 19px;
			}
		}
	}
	.line {
		height: 8px;
		background: rgba(39, 55, 83, 0.7);
		border-radius: 1px 1px 1px 1px;
		opacity: 1;
		margin-top: 10px;
		position: relative;
		.animation {
			width: 49px;
			height: 8px;
			position: absolute;
			left: 0;
			background: linear-gradient(90deg, rgba(255, 199, 0, 0) 0%, v-bind(barColor) 100%);
			border-radius: 1px 1px 1px 1px;
			opacity: 1;
			animation: runOne 5s linear infinite;
      animation-delay: v-bind(animationDelay);
		}
	}
}
@keyframes runOne {
	from {
		left: 0;
	}

	to {
		left: calc(100% - 49px);
	}
}
</style>
