<template>
	<div class="chart" ref="chartDom"></div>
</template>
<script lang="ts" setup>
import { withDefaults, ref, onMounted, computed } from "vue";
import * as echarts from "echarts/core";
import { GridComponent, GridComponentOption, TooltipComponent, LegendComponent } from "echarts/components";
import { BarChart, BarSeriesOption } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([GridComponent, BarChart, CanvasRenderer, TooltipComponent, LegendComponent]);

type EChartsOption = echarts.ComposeOption<GridComponentOption | BarSeriesOption>;

interface SeriesItf {
	name?: string;
	data?: number[];
	linearGradientColor?: string[];
	showSymbol?: boolean;
}
interface Props {
	colors?: string[];
	gridTop?: string;
	titles?: string[];
	legendFontSize?: number;
	xData?: string[];
	series?: SeriesItf[];
	showLegend?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
	colors: () => ["#2981EA"], 
	gridTop: "15%",
	titles: () => [],
	legendFontSize: 12,
	xData: () => ["1月", "2月", "3月", "4月", "5月", "6月"],
	series: () => [],
	showLegend: true,
});

const chartOption = computed(() => {
	let option: EChartsOption = {
		grid: {
			left: "3%",
			right: "3%",
			bottom: "0%",
			top: props.gridTop,
			containLabel: true,
		},
		color: props.colors,
		xAxis: [
			{
				type: "category",
				boundaryGap: true,
				data: props.xData,
				axisLabel: {
					show: true,
					color: "#ffffff",
					fontSize: 12,
					fontWeight: 300,
				},
			},
		],
		yAxis: [
			{
				type: "value",
				splitLine: {
					lineStyle: {
						type: "dashed", //虚线
						color: ["rgba(255,255,255,0.3)"],
						width: 1,
					},
					show: true, //隐藏
				},
				axisLabel: {
					show: true,
					color: "#ffffff",
					fontSize: 12,
					fontWeight: 300,
				},
				max: barBackGroundData.value.length ? barBackGroundData.value[0] - 100 : null,
			},
		],
		series: props.series
			.map((e: SeriesItf) => {
				let item: BarSeriesOption = {
					name: e.name || null,
					type: "bar",
					data: e.data,
					barWidth: 15,
				};
				return item;
			})
			.concat([
				{
					name: "",
					type: "bar",
					zlevel: -1,
					barGap: "-150%",
					data: barBackGroundData.value,
					color: "rgba(33,94,167,0.2)",
					barWidth: 30,
				},
			]),
	};
	if (props.showLegend) {
		option.legend = {
			icon: "rect",
			itemWidth: 10,
			itemHeight: 10,
			data: props.series.map((e: SeriesItf) => {
				return e.name || "";
			}),
			textStyle: {
				fontSize: props.legendFontSize, //字体大小
				color: "#D0DEEE", //字体颜色
			},
		};
	}
	return option;
});

const barBackGroundData = computed(() => {
	let max = 0;
	let maxLength = 0;
	for (const key in props.series) {
		const element = props.series[key];
		if (element.data.length) {
			const itemMax = element.data.reduce((a, b) => (a > b ? a : b));
			if (itemMax > max) {
				max = itemMax;
			}
		}
		if (element.data.length > maxLength) {
			maxLength = element.data.length;
		}
	}
	let data = [];
	max = Math.floor(max / 10) * 10;
	max += 200;
	for (let index = 0; index < maxLength; index++) {
		data.push(max);
	}
	return data;
});

const chartDom = ref();
let myChart;
const optionRef = ref<EChartsOption>(chartOption.value);

onMounted(() => {
	myChart = echarts.init(chartDom.value);
	myChart.setOption(optionRef.value);
});
</script>
<style lang="less" scoped>
.chart {
	width: 100%;
	min-height: 200px;
}
</style>
