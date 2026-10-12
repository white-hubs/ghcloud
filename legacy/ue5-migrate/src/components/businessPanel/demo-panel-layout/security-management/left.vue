<template>
	<div >
		<SubPanelTemplate title="安全运营天数" class="operate">
			<OperateDays :value="1719" title="运营天数" />
			<div class="operate-cue">{{nowTime}}</div>
			<div class="operate-cue">成都-双流区</div>
			<div class="operate-cue">pm2.5&nbsp;&nbsp;&nbsp;5°C</div>
		</SubPanelTemplate>
		<SubPanelTemplate title="园区用电" class="electric space">
			<ElectricityItem title="今日用电" :value="9802.46" :radio="1.25" bar-color="#2981EA" animation-delay=".8s" />
			<ElectricityItem :value="18521.52" :radio="3.56" title="昨日用电" />
		</SubPanelTemplate>
		<SubPanelTemplate title="用电趋势" class="space">
			<ElectricTrend :x-data="['8月', '9月', '10月', '11月', '12月', '1月', '2月']" name="用电趋势"
				:data="[684130.48, 651210.56, 597110.93, 475750.25, 553470.78, 446120.36, 351420.77]" />
		</SubPanelTemplate>
		<SubPanelTemplate title="报警趋势" class="space">
			<LineChart :titles="['车辆违停', '电气报警', '安防监控', '明火报警']" :legend-font-size="10"
				:x-data="['8月', '9月', '10月', '11月', '12月', '1月', '2月']" :series="[
					{ name: '车辆违停', data: [0, 0, 1, 10, 50, 150, 191], showSymbol: true },
					{ name: '电气报警', data: [0, 0, 56, 51, 21, 34, 10], showSymbol: true },
					{ name: '安防监控', data: [0, 0, 0, 0, 0, 0, 0], showSymbol: true },
					{ name: '明火报警', data: [0, 0, 0, 0, 0, 0, 0], showSymbol: true },
				]" />
		</SubPanelTemplate>
	</div>
</template>
<script lang="ts" setup>
import SubPanelTemplate from "../../../businessPanel/public/subPanelTemplate.vue";
import LineChart from "../../../businessPanel/public/lineChart.vue";
import OperateDays from "../../public/operateDays.vue";
import ElectricityItem from "../../public/electricityItem.vue";
import ElectricTrend from "../../public/electricTrend.vue";

import {getNowDateTime} from "@/utils/common"
import { onMounted, ref,onUnmounted } from "vue";
const nowTime = ref();
let timer:any
onMounted(() =>{
	nowTime.value = getNowDateTime("MM-DD HH:mm:ss");
	timer = setInterval(() =>{
		nowTime.value = getNowDateTime("MM-DD HH:mm:ss");
	},1000)
})
onUnmounted(() =>{
	clearInterval(timer)
})
</script>
<style lang="less" scoped>
.panel {
	padding: 8px;
	display: flex;
	flex-direction: column;
}

.operate {
	.operate-cue {
		width: 108px;
		height: 30px;
		background: rgba(0, 0, 0, 0.15);
		border-radius: 4px 4px 4px 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		font-weight: 400;
		color: #d0deee;
		margin-top: 12px;
		margin-left: 4px;
	}
}

.electric {
	padding: 0;
	box-sizing: border-box;
}
.space {
	padding: 10px 0;
}
</style>
