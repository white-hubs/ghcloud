<template>
	<div class="chart" ref="chartDom"></div>
</template>
<script lang="ts" setup>
import { withDefaults, ref, onMounted, computed, watch } from "vue";
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
		tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
    }
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
			},
		],
		series: props.series
			.map((e: SeriesItf) => {
				let item: BarSeriesOption = {
					name: e.name || null,
					type: "bar",
					data: e.data,
					barWidth: 15,
          label: {
            color:'#ffffff',
            show: true,
            position: 'top'
          }
				};
				return item;
			})
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

const chartDom = ref();
let myChart;
const optionRef = ref<EChartsOption>(chartOption.value);
const render = () => {
	myChart = echarts.init(chartDom.value);
	myChart.setOption(optionRef.value);
}
onMounted(() => {
	render()
});
watch(
  () => [...props.xData],
  () => {
    render();
  }
);
</script>
<style lang="less" scoped>
.chart {
	width: 100%;
	min-height: 200px;
}
</style>
