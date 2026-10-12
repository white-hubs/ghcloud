<template>
	<div class="alarmTable">
		<div class="header">
			<div v-for="(item, index) in column" :key="index" style="white-space: nowrap;" :style="{ ...item.style }">
				{{ item.label }}
			</div>
		</div>
		<div class="scroll_warp">
			<vue-seamless-scroll :data="listData" :class-option="defaultOption">
				<div v-for="(item, index) in listData" :key="index" :class="['item', index % 2 === 0 && 'bg_item']">
					<div class="cell" v-for="(items, index) in column" :key="index" :style="{ ...items.style } ">
						<span v-if="items.value === 'status'" :class="[item[items.value] === '正常' ? 'success' : 'warning']">{{ item[items.value] }}</span>
						<span v-else>{{ item[items.value] }}</span>
					</div>
				</div>
			</vue-seamless-scroll>
		</div>
	</div>
</template>

<script lang="ts" setup>
// 滚动表格组件
import { withDefaults, reactive, computed, StyleValue } from "vue";
const column = reactive([
	{
		label: "巡检对象",
		value: "name",
		style: {
			width: "20%",
			textAlign: "left",
		},
	},
	{
		label: "对象类型",
		value: "level",
		style: {
			width: "25%",
			textAlign: "center",
		},
	},
	{
		label: "巡检结果",
		value: "status",
		style: {
			width: "20%",
			textAlign: "center",
		},
	},
	{
		label: "巡检时间",
		value: "time",
		style: {
			width: "35%",
			textAlign: "center",
		},
	},
]);
const listData = reactive([
	{
		level: `档位`,
		name: `海E04`,
		time: "2023.02.20 21:14",
		status: "正常",
	},
	{
		level: `消防设备`,
		name: `海E115`,
		time: "2023.02.20 22:34",
		status: "正常",
	},
	{
		level: `消防设备`,
		name: `菜C125`,
		time: "2023.02.20 23:41",
		status: "正常",
	},
	{
		level: `电气设备`,
		name: `负一楼机房`,
		time: "2023.02.20 23:51",
		status: "异常",
	},
	{
		level: `监控设备`,
		name: `五号门摄像机9号`,
		time: "2023.02.21 04:02",
		status: "正常",
	},
	{
		level: `监控设备`,
		name: `二号门摄像机2号`,
		time: "2023.02.21 04:11",
		status: "正常",
	},
	{
		level: `动环设备`,
		name: `南区UPS机房`,
		time: "2023.02.21 04:20",
		status: "正常",
	},
	{
		level: `档位`,
		name: `肉类B02`,
		time: "2023.02.21 04:31",
		status: "正常",
	},
]);
const defaultOption = computed(() => {
	return {
		step: 0.5, // 数值越大速度滚动越快
		limitMoveNum: 4, // 开始无缝滚动的数据量 this.dataList.length
		hoverStop: true, // 是否开启鼠标悬停stop
		direction: 1, // 0向下 1向上 2向左 3向右
		openWatch: true, // 开启数据实时监控刷新dom
		singleHeight: 40, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
		singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
		waitTime: 1000, // 单步运动停止的时间(默认值1000ms)
	};
});
</script>

<style scoped lang="less">
.title {
	font-size: 16px;
	font-weight: 400;
	color: #d0deee;
  margin: 12px;
}
.header {
	display: flex;
	justify-content: space-between;
	padding: 9px 25px 9px 15px;
	background: rgba(86, 142, 255, 0.2);
	border: 1px solid rgba(86, 142, 255, 0.302);
	position: relative;
	width: 100%;
  color:white;
	&::after {
		content: "";
		width: 100%;
		height: 2px;
		display: block;
		background: rgba(86, 142, 255, 0.4);
		position: absolute;
		bottom: 0px;
    left: 0;
	}
	div {
		width: 25%;
	}
}
.scroll_warp {
	margin: 0 auto;
	width: 100%;
	height: 150px;
	overflow: hidden;
	.item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 9px 25px 9px 15px;
		margin: 0;
    	color:#D9E7FF;
		.cell {
			width: 25%;
			white-space: nowrap;
			text-overflow: ellipsis;
			overflow: hidden;
			.warning {
				color: #F14545;
			}
			.success {
				color: #00f27b;
			}
		}
	}
	.bg_item {
		background: rgba(171, 177, 189, 0.12);
	}
}
</style>
